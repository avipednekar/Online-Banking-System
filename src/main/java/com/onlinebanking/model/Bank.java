package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "banks")
public class Bank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String bankName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Bank() {
    }

    public Bank(String bankName) {
        this.bankName = bankName;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getBankName() {
        return bankName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
