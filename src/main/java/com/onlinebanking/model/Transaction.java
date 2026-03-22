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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(nullable = false)
    private String transactionReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionChannel channel;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    private String counterpartyAccountNumber;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public Transaction() {
    }

    public Transaction(Account account,
                       String transactionReference,
                       TransactionType type,
                       TransactionStatus status,
                       TransactionChannel channel,
                       BigDecimal amount,
                       String counterpartyAccountNumber,
                       String description) {
        this.account = account;
        this.transactionReference = transactionReference;
        this.type = type;
        this.status = status;
        this.channel = channel;
        this.amount = amount;
        this.counterpartyAccountNumber = counterpartyAccountNumber;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.completedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public Account getAccount() {
        return account;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public TransactionType getType() {
        return type;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public TransactionChannel getChannel() {
        return channel;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCounterpartyAccountNumber() {
        return counterpartyAccountNumber;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
