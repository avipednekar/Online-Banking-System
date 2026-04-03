package com.onlinebanking.dto;

import com.onlinebanking.model.TransactionChannel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateTransferRequest(
        @NotBlank String fromAccountId,
        @NotBlank String beneficiaryId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotBlank
        @Pattern(regexp = "^INR$", message = "Currency must be INR")
        String currency,
        @NotBlank @Size(max = 255) String remarks,
        @NotNull TransactionChannel channel
) {
}
