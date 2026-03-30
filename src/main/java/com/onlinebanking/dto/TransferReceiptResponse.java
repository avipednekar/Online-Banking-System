package com.onlinebanking.dto;

import com.onlinebanking.model.TransactionChannel;
import com.onlinebanking.model.TransferStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransferReceiptResponse(
        String transferId,
        String postingBatchId,
        String fromAccountId,
        String toAccountId,
        String beneficiaryId,
        BigDecimal amount,
        String currency,
        TransactionChannel channel,
        TransferStatus status,
        String remarks,
        String failureCode,
        LocalDateTime createdAt,
        LocalDateTime completedAt
) {
}
