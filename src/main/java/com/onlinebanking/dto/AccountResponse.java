package com.onlinebanking.dto;

import com.onlinebanking.model.AccountStatus;
import com.onlinebanking.model.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        AccountType accountType,
        AccountStatus status,
        String currencyCode,
        BigDecimal balance,
        Long ownerId,
        String ownerUsername,
        LocalDateTime createdAt
) {
}
