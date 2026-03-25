package com.onlinebanking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BeneficiaryRequest(
        @NotBlank @Size(max = 80) String nickname,
        @NotBlank @Size(max = 120) String bankName,
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Account number contains invalid characters")
        String accountNumber
) {
}
