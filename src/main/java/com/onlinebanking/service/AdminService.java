package com.onlinebanking.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.onlinebanking.dto.AccountOpeningRequestResponse;
import com.onlinebanking.dto.AdminCustomerDetailResponse;
import com.onlinebanking.dto.AdminCustomerListItemResponse;
import com.onlinebanking.dto.AdminOverviewResponse;
import com.onlinebanking.dto.PagedResponse;
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
import com.onlinebanking.util.NormalizationUtils;

import jakarta.transaction.Transactional;

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

    public PagedResponse<AdminCustomerListItemResponse> getCustomersPaged(int page,
                                                                          int size,
                                                                          String search,
                                                                          KycStatus kycStatus) {
        String normalizedQuery = search == null ? "" : search.trim();
        boolean queryBlank = normalizedQuery.isBlank();
        String emailHash = normalizedQuery.contains("@") ? NormalizationUtils.hashEmail(normalizedQuery) : null;
        String phoneHash = normalizedQuery.replaceAll("[^0-9]", "").length() >= 10
                ? NormalizationUtils.hashPhone(normalizedQuery)
                : null;

        return PagedResponse.from(
                customerProfileRepository.searchAdminCustomers(
                        normalizedQuery,
                        queryBlank,
                        emailHash,
                        phoneHash,
                        kycStatus,
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
                ),
                this::toCustomerListItemResponse
        );
    }

    public AdminCustomerDetailResponse getCustomerDetail(Long userId) {
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        return toCustomerDetailResponse(profile);
    }

    public List<AccountOpeningRequestResponse> getPendingAccountRequests() {
        return accountOpeningRequestRepository.findByStatusOrderByCreatedAtAsc(AccountOpeningRequestStatus.PENDING).stream()
                .map(bankingService::toAccountOpeningRequestResponse)
                .toList();
    }

    @Transactional
    public AdminCustomerDetailResponse updateKycStatus(String adminUsername, Long userId, UpdateKycStatusRequest request) {
        BankUser user = bankUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));

        profile.setKycStatus(request.kycStatus());
        CustomerProfile savedProfile = customerProfileRepository.save(profile);

        if (request.kycStatus() == KycStatus.VERIFIED) {
            BankUser admin = bankUserRepository.findByUsernameIgnoreCase(adminUsername)
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            accountOpeningRequestRepository.findByRequesterUsernameIgnoreCaseOrderByCreatedAtDesc(user.getUsername()).stream()
                    .filter(req -> req.getStatus() == AccountOpeningRequestStatus.PENDING)
                    .forEach(req -> bankingService.approveAccountOpeningRequest(admin, req));
        }

        auditService.log(
                adminUsername,
                "KYC_STATUS_UPDATED",
                "CustomerProfile",
                String.valueOf(savedProfile.getId()),
                "KYC set to " + request.kycStatus() + " for customer " + user.getUsername()
        );
        log.info("Admin {} set KYC status {} for user {}", adminUsername, request.kycStatus(), user.getUsername());
        return toCustomerDetailResponse(savedProfile);
    }

    @Transactional
    public AccountOpeningRequestResponse approveAccountRequest(String adminUsername, Long requestId) {
        BankUser admin = bankUserRepository.findByUsernameIgnoreCase(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        AccountOpeningRequest accountOpeningRequest = accountOpeningRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Account opening request not found"));

        return bankingService.approveAccountOpeningRequest(admin, accountOpeningRequest);
    }

    private AdminCustomerListItemResponse toCustomerListItemResponse(CustomerProfile profile) {
        return new AdminCustomerListItemResponse(
                profile.getUser().getId(),
                profile.getCustomerId(),
                profile.getUser().getUsername(),
                profile.getUser().getEmail(),
                profile.getFullName(),
                profile.getPhoneNumber(),
                profile.getCity(),
                profile.getState(),
                profile.getKycStatus().name()
        );
    }

    private AdminCustomerDetailResponse toCustomerDetailResponse(CustomerProfile profile) {
        return new AdminCustomerDetailResponse(
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
