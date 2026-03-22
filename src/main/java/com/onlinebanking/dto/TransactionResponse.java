package com.onlinebanking.dto;

import com.onlinebanking.model.TransactionChannel;
import com.onlinebanking.model.TransactionStatus;
import com.onlinebanking.model.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String transactionReference,
        String accountNumber,
        TransactionType type,
        TransactionStatus status,
        TransactionChannel channel,
        BigDecimal amount,
        String counterpartyAccountNumber,
        String description,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}
