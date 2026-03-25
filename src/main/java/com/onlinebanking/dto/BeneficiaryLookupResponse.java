package com.onlinebanking.dto;

public record BeneficiaryLookupResponse(
        String accountNumber,
        String accountHolderName,
        String accountType,
        String accountStatus,
        String bankName
) {
}
