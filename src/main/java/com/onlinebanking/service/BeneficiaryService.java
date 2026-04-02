package com.onlinebanking.service;

import com.onlinebanking.dto.BeneficiaryLookupResponse;
import com.onlinebanking.dto.BeneficiaryActivationRequest;
import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.DuplicateResourceException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.Account;
import com.onlinebanking.model.AccountStatus;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.Beneficiary;
import com.onlinebanking.model.BeneficiaryStatus;
import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.repository.AccountRepository;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.BeneficiaryRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import com.onlinebanking.security.crypto.SensitiveDataCrypto;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BeneficiaryService {

    private static final Logger log = LoggerFactory.getLogger(BeneficiaryService.class);
    private static final String INTERNAL_BANK_NAME = "Internal Bank";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final BankUserRepository bankUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AuditService auditService;
    private final OutboxService outboxService;
    private final int coolingPeriodMinutes;
    private final int activationWindowMinutes;
    private final boolean autoActivate;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                              AccountRepository accountRepository,
                              BankUserRepository bankUserRepository,
                              CustomerProfileRepository customerProfileRepository,
                              AuditService auditService,
                              OutboxService outboxService,
                              @Value("${app.beneficiary.cooling-period-minutes:240}") int coolingPeriodMinutes,
                              @Value("${app.beneficiary.activation-window-minutes:30}") int activationWindowMinutes,
                              @Value("${app.beneficiary.auto-activate:false}") boolean autoActivate) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.accountRepository = accountRepository;
        this.bankUserRepository = bankUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.auditService = auditService;
        this.outboxService = outboxService;
        this.coolingPeriodMinutes = coolingPeriodMinutes;
        this.activationWindowMinutes = activationWindowMinutes;
        this.autoActivate = autoActivate;
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

        Beneficiary beneficiary = new Beneficiary(
                owner,
                request.nickname().trim(),
                normalizedAccountNumber
        );
        beneficiary.activate();
        beneficiary = beneficiaryRepository.save(beneficiary);

        auditService.log(username, "BENEFICIARY_CREATED", "Beneficiary", String.valueOf(beneficiary.getId()),
                "Beneficiary added for account " + beneficiary.getAccountNumber());
        log.info("Beneficiary {} created for user {} with status {}", beneficiary.getAccountNumber(), username, beneficiary.getStatus());
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

    @Transactional
    public BeneficiaryResponse activateBeneficiary(String username, String beneficiaryId, BeneficiaryActivationRequest request) {
        Beneficiary beneficiary = beneficiaryRepository.findByBeneficiaryIdAndOwnerUsernameIgnoreCase(beneficiaryId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        if (beneficiary.isActive()) {
            return toResponse(beneficiary, resolveAccountHolderName(beneficiary.getAccountNumber()));
        }
        beneficiary.activate();
        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        auditService.log(username, "BENEFICIARY_ACTIVATED", "Beneficiary", String.valueOf(saved.getId()),
                "Beneficiary activated for account " + saved.getAccountNumber());
        return toResponse(saved, resolveAccountHolderName(saved.getAccountNumber()));
    }

    public void ensureActiveBeneficiary(String username, String destinationAccountNumber) {
        getActiveBeneficiaryByAccountNumber(username, destinationAccountNumber);
    }

    public Beneficiary getActiveBeneficiaryByAccountNumber(String username, String destinationAccountNumber) {
        return beneficiaryRepository.findByOwnerUsernameIgnoreCaseAndAccountNumberAndStatus(
                        username,
                        destinationAccountNumber.trim(),
                        BeneficiaryStatus.ACTIVE)
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
                beneficiary.getBeneficiaryId(),
                beneficiary.getNickname(),
                INTERNAL_BANK_NAME,
                beneficiary.getAccountNumber(),
                accountHolderName,
                beneficiary.getStatus().name(),
                beneficiary.isActive(),
                beneficiary.getActivationReadyAt(),
                beneficiary.getCreatedAt()
        );
    }

    private String generateActivationCode() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}
