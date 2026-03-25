package com.onlinebanking.dto;

import java.time.LocalDateTime;

public record BeneficiaryResponse(
        Long id,
        String nickname,
        String bankName,
        String accountNumber,
        String accountHolderName,
        boolean active,
        LocalDateTime createdAt
) {
}
