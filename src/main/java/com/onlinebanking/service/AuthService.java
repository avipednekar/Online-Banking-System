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
import com.onlinebanking.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final BankUserRepository bankUserRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthService(BankUserRepository bankUserRepository,
                       CustomerProfileRepository customerProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuditService auditService) {
        this.bankUserRepository = bankUserRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (bankUserRepository.existsByUsernameIgnoreCase(request.username())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (bankUserRepository.existsByEmailIgnoreCase(request.email())) {
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
                request.country().trim(),
                request.dateOfBirth()
        ));
        auditService.log(savedUser.getUsername(), "USER_REGISTERED", "BankUser", String.valueOf(savedUser.getId()),
                "New customer registered");
        return buildAuthResponse(savedUser, "User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        BankUser user = bankUserRepository.findByUsernameIgnoreCase(request.username().trim())
                .orElseThrow(() -> new BusinessException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Invalid username or password");
        }

        return buildAuthResponse(user, "Login successful");
    }

    public UserProfileResponse getCurrentUser(String username) {
        BankUser user = bankUserRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == UserRole.ADMIN) {
            return new UserProfileResponse(
                    user.getId(),
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

    private AuthResponse buildAuthResponse(BankUser user, String message) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                jwtService.generateToken(user),
                jwtService.getExpirationMs(),
                message
        );
    }
}
