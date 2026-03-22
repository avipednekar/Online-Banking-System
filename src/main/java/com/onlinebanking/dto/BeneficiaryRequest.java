package com.onlinebanking.dto;

import jakarta.validation.constraints.NotBlank;

public record BeneficiaryRequest(
        @NotBlank String nickname,
        @NotBlank String bankName,
        @NotBlank String accountNumber
) {
}
