package com.onlinebanking.dto;

public record UserProfileResponse(
        Long userId,
        String customerId,
        String username,
        String email,
        String role,
        String fullName,
        String phoneNumber,
        String gender,
        String occupation,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        String dateOfBirth,
        String kycStatus
) {
}
