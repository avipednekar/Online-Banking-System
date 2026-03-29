package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "account_number_sequences")
public class AccountNumberSequence {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 20)
    private AccountType accountType;

    @Column(name = "last_value", nullable = false)
    private long lastValue;

    public AccountNumberSequence() {
    }

    public AccountNumberSequence(AccountType accountType) {
        this.accountType = accountType;
        this.lastValue = 0;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public long nextValue() {
        lastValue++;
        return lastValue;
    }
}
