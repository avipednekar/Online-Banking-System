package com.onlinebanking.service;

import com.onlinebanking.dto.BeneficiaryLookupResponse;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.DuplicateResourceException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.Account;
import com.onlinebanking.model.AccountStatus;
import com.onlinebanking.model.Bank;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.Beneficiary;
import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.repository.AccountRepository;
import com.onlinebanking.repository.BankRepository;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.BeneficiaryRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BeneficiaryService {

    private static final Logger log = LoggerFactory.getLogger(BeneficiaryService.class);
    private static final String INTERNAL_BANK_NAME = "Internal Bank";

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final BankRepository bankRepository;
    private final BankUserRepository bankUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AuditService auditService;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                              AccountRepository accountRepository,
                              BankRepository bankRepository,
                              BankUserRepository bankUserRepository,
                              CustomerProfileRepository customerProfileRepository,
                              AuditService auditService) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountRepository = accountRepository;
        this.bankRepository = bankRepository;
        this.bankUserRepository = bankUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BeneficiaryResponse createBeneficiary(String username, BeneficiaryRequest request) {
        String normalizedAccountNumber = request.accountNumber().trim();
        if (beneficiaryRepository.existsByOwnerUsernameIgnoreCaseAndAccountNumber(username, normalizedAccountNumber)) {
            throw new DuplicateResourceException("Beneficiary already exists for this account number");
        }

        BankUser owner = bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        BeneficiaryLookupResponse verifiedAccount = verifyBeneficiaryAccount(owner, normalizedAccountNumber);
        Bank bank = resolveBank(verifiedAccount.bankName());

        Beneficiary beneficiary = beneficiaryRepository.save(new Beneficiary(
                owner,
                request.nickname().trim(),
                bank,
                normalizedAccountNumber
        ));

        auditService.log(username, "BENEFICIARY_CREATED", "Beneficiary", String.valueOf(beneficiary.getId()),
                "Beneficiary added for account " + beneficiary.getAccountNumber());
        log.info("Beneficiary {} created for user {}", beneficiary.getAccountNumber(), username);
        return toResponse(beneficiary, verifiedAccount.accountHolderName());
    }

    public List<BeneficiaryResponse> getBeneficiaries(String username) {
        return beneficiaryRepository.findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(username).stream()
                .map(beneficiary -> toResponse(
                        beneficiary,
                        resolveAccountHolderName(beneficiary.getAccountNumber())
                ))
                .toList();
    }

    public void ensureActiveBeneficiary(String username, String destinationAccountNumber) {
        beneficiaryRepository.findByOwnerUsernameIgnoreCaseAndAccountNumberAndActiveTrue(username, destinationAccountNumber.trim())
                .orElseThrow(() -> new BusinessException("Transfer destination must be an approved beneficiary"));
    }

    public BeneficiaryLookupResponse lookupBeneficiary(String username, String accountNumber) {
        BankUser owner = bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return verifyBeneficiaryAccount(owner, accountNumber.trim());
    }

    private BeneficiaryLookupResponse verifyBeneficiaryAccount(BankUser owner, String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary account not found"));

        if (account.getOwner().getId().equals(owner.getId())) {
            throw new BusinessException("You cannot add your own account as a beneficiary");
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("Beneficiary account is not active");
        }

        return new BeneficiaryLookupResponse(
                account.getAccountNumber(),
                resolveAccountHolderName(account),
                account.getAccountType().name(),
                account.getStatus().name(),
                INTERNAL_BANK_NAME
        );
    }

    private String resolveAccountHolderName(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .map(this::resolveAccountHolderName)
                .orElse("Unavailable");
    }

    private String resolveAccountHolderName(Account account) {
        return customerProfileRepository.findByUserId(account.getOwner().getId())
                .map(CustomerProfile::getFullName)
                .orElse(account.getOwner().getUsername());
    }

    private BeneficiaryResponse toResponse(Beneficiary beneficiary, String accountHolderName) {
        return new BeneficiaryResponse(
                beneficiary.getId(),
                beneficiary.getNickname(),
                beneficiary.getBankName(),
                beneficiary.getAccountNumber(),
                accountHolderName,
                beneficiary.isActive(),
                beneficiary.getCreatedAt()
        );
    }

    private Bank resolveBank(String bankName) {
        String normalizedBankName = bankName.trim();
        return bankRepository.findByBankNameIgnoreCase(normalizedBankName)
                .orElseGet(() -> bankRepository.save(new Bank(normalizedBankName)));
    }
}
