package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_balances")
public class AccountBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "account_id", unique = true)
    private Account account;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal availableBalance;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal ledgerBalance;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    public AccountBalance() {
    }

    public AccountBalance(Account account, BigDecimal openingBalance) {
        this.account = account;
        this.availableBalance = openingBalance;
        this.ledgerBalance = openingBalance;
        this.updatedAt = LocalDateTime.now();
    }

    public Account getAccount() {
        return account;
    }

    public BigDecimal getAvailableBalance() {
        return availableBalance;
    }

    public BigDecimal getLedgerBalance() {
        return ledgerBalance;
    }

    public void credit(BigDecimal amount) {
        this.availableBalance = availableBalance.add(amount);
        this.ledgerBalance = ledgerBalance.add(amount);
        this.updatedAt = LocalDateTime.now();
    }

    public void debit(BigDecimal amount) {
        this.availableBalance = availableBalance.subtract(amount);
        this.ledgerBalance = ledgerBalance.subtract(amount);
        this.updatedAt = LocalDateTime.now();
    }
}
