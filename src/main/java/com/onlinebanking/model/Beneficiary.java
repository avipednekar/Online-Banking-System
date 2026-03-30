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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;

import com.onlinebanking.util.IdentifierGenerator;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "beneficiaries",
        uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "account_number"})
)
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String beneficiaryId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "owner_id")
    private BankUser owner;

    @Column(nullable = false)
    private String nickname;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BeneficiaryStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime activationReadyAt;

    private LocalDateTime activationExpiresAt;

    private LocalDateTime activatedAt;

    @Column(length = 128)
    private String activationCodeHash;

    @Version
    private Long version;

    public Beneficiary() {
    }

    public Beneficiary(BankUser owner, String nickname, String accountNumber) {
        this.beneficiaryId = IdentifierGenerator.newId("BEN");
        this.owner = owner;
        this.nickname = nickname;
        this.accountNumber = accountNumber;
        this.status = BeneficiaryStatus.PENDING_ACTIVATION;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getBeneficiaryId() {
        return beneficiaryId;
    }

    public BankUser getOwner() {
        return owner;
    }

    public String getNickname() {
        return nickname;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public boolean isActive() {
        return status == BeneficiaryStatus.ACTIVE;
    }

    public BeneficiaryStatus getStatus() {
        return status;
    }

    public LocalDateTime getActivationReadyAt() {
        return activationReadyAt;
    }

    public LocalDateTime getActivationExpiresAt() {
        return activationExpiresAt;
    }

    public void startActivationWindow(String activationCodeHash,
                                      LocalDateTime activationReadyAt,
                                      LocalDateTime activationExpiresAt) {
        this.activationCodeHash = activationCodeHash;
        this.activationReadyAt = activationReadyAt;
        this.activationExpiresAt = activationExpiresAt;
        this.status = BeneficiaryStatus.PENDING_ACTIVATION;
    }

    public void activate() {
        this.status = BeneficiaryStatus.ACTIVE;
        this.activatedAt = LocalDateTime.now();
    }

    public void deactivate() {
        this.status = BeneficiaryStatus.REJECTED;
    }

    public String getActivationCodeHash() {
        return activationCodeHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
