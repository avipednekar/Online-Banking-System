package com.onlinebanking.dto;

import com.onlinebanking.model.AccountOpeningRequestStatus;
import com.onlinebanking.model.AccountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountOpeningRequestResponse(
        Long id,
        Long requesterId,
        String requesterUsername,
        String requesterFullName,
        AccountType accountType,
        BigDecimal openingBalance,
        String kycStatus,
        AccountOpeningRequestStatus status,
        String approvedAccountNumber,
        String reviewedBy,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}
