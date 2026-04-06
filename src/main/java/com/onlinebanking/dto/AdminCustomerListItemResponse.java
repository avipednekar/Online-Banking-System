package com.onlinebanking.dto;

public record AdminCustomerListItemResponse(
        Long userId,
        String customerId,
        String username,
        String email,
        String fullName,
        String phoneNumber,
        String city,
        String state,
        String kycStatus
) {
}
