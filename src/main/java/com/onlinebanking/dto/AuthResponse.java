package com.onlinebanking.dto;

public record AuthResponse(
        Long userId,
        String username,
        String role,
        String token,
        long expiresIn,
        String message
) {
}
