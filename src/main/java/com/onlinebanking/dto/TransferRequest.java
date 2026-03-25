package com.onlinebanking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record TransferRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Source account number contains invalid characters")
        String fromAccountNumber,
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Destination account number contains invalid characters")
        String toAccountNumber,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {
}
