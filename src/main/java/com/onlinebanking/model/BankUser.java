package com.onlinebanking.model;

import com.onlinebanking.security.crypto.EncryptedStringConverter;
import com.onlinebanking.util.NormalizationUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bank_users")
public class BankUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, length = 1024)
    private String email;

    @Column(nullable = false, unique = true, length = 64)
    private String emailHash;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private int failedLoginAttempts;

    private LocalDateTime lockedUntil;

    @OneToMany(mappedBy = "owner")
    private List<Account> accounts = new ArrayList<>();

    @OneToMany(mappedBy = "owner")
    private List<Beneficiary> beneficiaries = new ArrayList<>();

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private CustomerProfile customerProfile;

    public BankUser() {
    }

    public BankUser(String username, String email, String passwordHash) {
        this.username = username;
        setEmail(email);
        this.passwordHash = passwordHash;
        this.role = UserRole.USER;
        this.createdAt = LocalDateTime.now();
        this.failedLoginAttempts = 0;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = NormalizationUtils.normalizeEmail(email);
        this.emailHash = NormalizationUtils.hashEmail(email);
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getEmailHash() {
        return emailHash;
    }

    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public void recordFailedLoginAttempt(int maxAttempts, int lockMinutes) {
        failedLoginAttempts++;
        if (failedLoginAttempts >= maxAttempts) {
            lockedUntil = LocalDateTime.now().plusMinutes(lockMinutes);
            failedLoginAttempts = 0;
        }
    }

    public void clearFailedLoginAttempts() {
        failedLoginAttempts = 0;
        lockedUntil = null;
    }

    public List<Account> getAccounts() {
        return accounts;
    }

    public List<Beneficiary> getBeneficiaries() {
        return beneficiaries;
    }

    public CustomerProfile getCustomerProfile() {
        return customerProfile;
    }
}
