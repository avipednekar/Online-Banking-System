package com.onlinebanking.dto;

public record AdminOverviewResponse(
        long totalCustomers,
        long pendingKyc,
        long verifiedKyc,
        long rejectedKyc,
        long totalAccounts,
        long activeBeneficiaries
) {
}
