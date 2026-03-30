package com.onlinebanking.dto;

public record AuthResponse(
        Long userId,
        String username,
        String role,
        String token,
        String refreshToken,
        String sessionId,
        long expiresIn,
        long refreshExpiresIn,
        String message
) {
}
