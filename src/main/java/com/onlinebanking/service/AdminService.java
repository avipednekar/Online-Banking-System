package com.onlinebanking.service;

import com.onlinebanking.dto.AdminCustomerResponse;
import com.onlinebanking.dto.AdminOverviewResponse;
import com.onlinebanking.dto.AccountOpeningRequestResponse;
import com.onlinebanking.dto.UpdateKycStatusRequest;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.AccountOpeningRequest;
import com.onlinebanking.model.AccountOpeningRequestStatus;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.BeneficiaryStatus;
import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.model.KycStatus;
import com.onlinebanking.repository.AccountOpeningRequestRepository;
import com.onlinebanking.repository.AccountRepository;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.BeneficiaryRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final BankUserRepository bankUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AccountOpeningRequestRepository accountOpeningRequestRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final BankingService bankingService;
    private final AuditService auditService;

    public AdminService(BankUserRepository bankUserRepository,
                        CustomerProfileRepository customerProfileRepository,
                        AccountOpeningRequestRepository accountOpeningRequestRepository,
                        AccountRepository accountRepository,
                        BeneficiaryRepository beneficiaryRepository,
                        BankingService bankingService,
                        AuditService auditService) {
        this.bankUserRepository = bankUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.accountOpeningRequestRepository = accountOpeningRequestRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.bankingService = bankingService;
        this.auditService = auditService;
    }

    public AdminOverviewResponse getOverview() {
        return new AdminOverviewResponse(
                bankUserRepository.countByRole(com.onlinebanking.model.UserRole.USER),
                customerProfileRepository.countByKycStatus(KycStatus.PENDING),
                customerProfileRepository.countByKycStatus(KycStatus.VERIFIED),
                customerProfileRepository.countByKycStatus(KycStatus.REJECTED),
                accountOpeningRequestRepository.countByStatus(AccountOpeningRequestStatus.PENDING),
                accountRepository.count(),
                beneficiaryRepository.countByStatus(BeneficiaryStatus.ACTIVE)
        );
    }

    public List<AdminCustomerResponse> getCustomers() {
        return customerProfileRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toCustomerResponse)
                .toList();
    }

    public List<AccountOpeningRequestResponse> getPendingAccountRequests() {
        return accountOpeningRequestRepository.findByStatusOrderByCreatedAtAsc(AccountOpeningRequestStatus.PENDING).stream()
                .map(bankingService::toAccountOpeningRequestResponse)
                .toList();
    }

    @Transactional
    public AdminCustomerResponse updateKycStatus(String adminUsername, Long userId, UpdateKycStatusRequest request) {
        BankUser user = bankUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        profile.setKycStatus(request.kycStatus());
        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        auditService.log(
                adminUsername,
                "KYC_STATUS_UPDATED",
                "CustomerProfile",
                String.valueOf(savedProfile.getId()),
                "KYC set to " + request.kycStatus() + " for customer " + user.getUsername()
        );
        log.info("Admin {} set KYC status {} for user {}", adminUsername, request.kycStatus(), user.getUsername());
        return toCustomerResponse(savedProfile);
    }

    @Transactional
    public AccountOpeningRequestResponse approveAccountRequest(String adminUsername, Long requestId) {
        BankUser admin = bankUserRepository.findByUsernameIgnoreCase(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        AccountOpeningRequest accountOpeningRequest = accountOpeningRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Account opening request not found"));

        return bankingService.approveAccountOpeningRequest(admin, accountOpeningRequest);
    }

    private AdminCustomerResponse toCustomerResponse(CustomerProfile profile) {
        return new AdminCustomerResponse(
                profile.getUser().getId(),
                profile.getCustomerId(),
                profile.getUser().getUsername(),
                profile.getUser().getEmail(),
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getGender().name(),
                profile.getOccupation(),
                profile.getAddressLine1(),
                profile.getAddressLine2(),
                profile.getCity(),
                profile.getState(),
                profile.getPostalCode(),
                profile.getCountry(),
                profile.getDateOfBirth().toString(),
                profile.getKycStatus().name()
        );
    }
}
