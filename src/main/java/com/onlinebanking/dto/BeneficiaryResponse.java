package com.onlinebanking.dto;

import java.time.LocalDateTime;

public record BeneficiaryResponse(
        Long id,
        String beneficiaryId,
        String nickname,
        String bankName,
        String accountNumber,
        String accountHolderName,
        String status,
        boolean active,
        LocalDateTime activationReadyAt,
        LocalDateTime createdAt
) {
}
