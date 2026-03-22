package com.onlinebanking.dto;

import com.onlinebanking.model.AccountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotNull AccountType accountType,
        @NotNull @DecimalMin(value = "100.00") BigDecimal openingBalance
) {
}
