package com.onlinebanking.service;

import com.onlinebanking.dto.BeneficiaryRequest;
import com.onlinebanking.dto.BeneficiaryResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.DuplicateResourceException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.Beneficiary;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.BeneficiaryRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final BankUserRepository bankUserRepository;
    private final AuditService auditService;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                              BankUserRepository bankUserRepository,
                              AuditService auditService) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.bankUserRepository = bankUserRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BeneficiaryResponse createBeneficiary(String username, BeneficiaryRequest request) {
        if (beneficiaryRepository.existsByOwnerUsernameIgnoreCaseAndAccountNumber(username, request.accountNumber().trim())) {
            throw new DuplicateResourceException("Beneficiary already exists for this account number");
        }

        BankUser owner = bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Beneficiary beneficiary = beneficiaryRepository.save(new Beneficiary(
                owner,
                request.nickname().trim(),
                request.bankName().trim(),
                request.accountNumber().trim()
        ));

        auditService.log(username, "BENEFICIARY_CREATED", "Beneficiary", String.valueOf(beneficiary.getId()),
                "Beneficiary added for account " + beneficiary.getAccountNumber());
        return toResponse(beneficiary);
    }

    public List<BeneficiaryResponse> getBeneficiaries(String username) {
        return beneficiaryRepository.findByOwnerUsernameIgnoreCaseOrderByCreatedAtDesc(username).stream()
                .map(this::toResponse)
                .toList();
    }

    public void ensureActiveBeneficiary(String username, String destinationAccountNumber) {
        beneficiaryRepository.findByOwnerUsernameIgnoreCaseAndAccountNumberAndActiveTrue(username, destinationAccountNumber.trim())
                .orElseThrow(() -> new BusinessException("Transfer destination must be an approved beneficiary"));
    }

    private BeneficiaryResponse toResponse(Beneficiary beneficiary) {
        return new BeneficiaryResponse(
                beneficiary.getId(),
                beneficiary.getNickname(),
                beneficiary.getBankName(),
                beneficiary.getAccountNumber(),
                beneficiary.isActive(),
                beneficiary.getCreatedAt()
        );
    }
}
