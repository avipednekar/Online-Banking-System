package com.onlinebanking.service;

import com.onlinebanking.dto.AuthResponse;
import com.onlinebanking.dto.LoginRequest;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.UserProfileResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.exception.DuplicateResourceException;
import com.onlinebanking.exception.ResourceNotFoundException;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.CustomerProfile;
import com.onlinebanking.model.UserRole;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.repository.CustomerProfileRepository;
import com.onlinebanking.util.IndiaMarketPolicy;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.onlinebanking.util.NormalizationUtils;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final BankUserRepository bankUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionService userSessionService;
    private final AuditService auditService;
    private final int maxLoginAttempts;
    private final int lockMinutes;

    public AuthService(BankUserRepository bankUserRepository,
                       CustomerProfileRepository customerProfileRepository,
                       PasswordEncoder passwordEncoder,
                       UserSessionService userSessionService,
                       AuditService auditService,
                       @org.springframework.beans.factory.annotation.Value("${app.security.max-login-attempts:5}") int maxLoginAttempts,
                       @org.springframework.beans.factory.annotation.Value("${app.security.lock-minutes:15}") int lockMinutes) {
        this.bankUserRepository = bankUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.userSessionService = userSessionService;
        this.auditService = auditService;
        this.maxLoginAttempts = maxLoginAttempts;
        this.lockMinutes = lockMinutes;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        return register(request, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress, String deviceFingerprint) {
        String normalizedCountry = IndiaMarketPolicy.normalizeCountry(request.country());
        if (!IndiaMarketPolicy.isSupportedCountry(normalizedCountry)) {
            throw new BusinessException("Online banking registration is available only to customers in India");
        }

        if (bankUserRepository.existsByUsernameIgnoreCase(request.username().trim())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (bankUserRepository.existsByEmailHash(NormalizationUtils.hashEmail(request.email()))) {
            throw new DuplicateResourceException("Email already exists");
        }

        BankUser user = new BankUser(
                request.username().trim(),
                request.email().trim(),
                passwordEncoder.encode(request.password())
        );
        BankUser savedUser = bankUserRepository.save(user);
        customerProfileRepository.save(new CustomerProfile(
                savedUser,
                request.fullName().trim(),
                request.phoneNumber().trim(),
                request.gender(),
                request.occupation().trim(),
                request.addressLine1().trim(),
                request.addressLine2() == null ? null : request.addressLine2().trim(),
                request.city().trim(),
                request.state().trim(),
                request.postalCode().trim(),
                normalizedCountry,
                request.dateOfBirth()
        ));
        auditService.log(savedUser.getUsername(), "USER_REGISTERED", "BankUser", String.valueOf(savedUser.getId()),
                "New customer registered");
        log.info("Registered new user {}", savedUser.getUsername());
        return userSessionService.issueSession(savedUser, "User registered successfully", ipAddress, deviceFingerprint);
    }

    public AuthResponse login(LoginRequest request) {
        return login(request, null, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String deviceFingerprint) {
        BankUser user = bankUserRepository.findByUsernameIgnoreCase(request.username().trim())
                .orElseThrow(() -> new BusinessException("Invalid username or password"));

        if (user.isLocked()) {
            throw new BusinessException("Account is temporarily locked due to repeated failed logins");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.recordFailedLoginAttempt(maxLoginAttempts, lockMinutes);
            bankUserRepository.save(user);
            log.warn("Failed login attempt for user {}", request.username().trim());
            throw new BusinessException("Invalid username or password");
        }

        user.clearFailedLoginAttempts();
        bankUserRepository.save(user);
        log.info("User {} authenticated successfully", user.getUsername());
        return userSessionService.issueSession(user, "Login successful", ipAddress, deviceFingerprint);
    }

    public AuthResponse refreshSession(String refreshToken) {
        return userSessionService.refresh(refreshToken);
    }

    public void logout(String refreshToken) {
        userSessionService.revoke(refreshToken);
    }

    public UserProfileResponse getCurrentUser(String username) {
        BankUser user = bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == UserRole.ADMIN) {
            return new UserProfileResponse(
                    user.getId(),
                    "ADMIN",
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    "Central Administrator",
                    null,
                    null,
                    "System Administration",
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "VERIFIED"
            );
        }
        CustomerProfile profile = customerProfileRepository.findByUserUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        return new UserProfileResponse(
                user.getId(),
                profile.getCustomerId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
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
