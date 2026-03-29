package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_opening_requests")
public class AccountOpeningRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requester_id")
    private BankUser requester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal openingBalance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountOpeningRequestStatus status;

    @OneToOne
    @JoinColumn(name = "approved_account_id", unique = true)
    private Account approvedAccount;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private BankUser reviewedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    public AccountOpeningRequest() {
    }

    public AccountOpeningRequest(BankUser requester, AccountType accountType, BigDecimal openingBalance) {
        this.requester = requester;
        this.accountType = accountType;
        this.openingBalance = openingBalance;
        this.status = AccountOpeningRequestStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public BankUser getRequester() {
        return requester;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public AccountOpeningRequestStatus getStatus() {
        return status;
    }

    public Account getApprovedAccount() {
        return approvedAccount;
    }

    public BankUser getReviewedBy() {
        return reviewedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void approve(BankUser reviewer, Account approvedAccount) {
        this.status = AccountOpeningRequestStatus.APPROVED;
        this.reviewedBy = reviewer;
        this.approvedAccount = approvedAccount;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(BankUser reviewer) {
        this.status = AccountOpeningRequestStatus.REJECTED;
        this.reviewedBy = reviewer;
        this.reviewedAt = LocalDateTime.now();
    }
}
