package com.onlinebanking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BeneficiaryActivationRequest(
        @NotBlank
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP code must be 6 digits")
        String otpCode
) {
}
