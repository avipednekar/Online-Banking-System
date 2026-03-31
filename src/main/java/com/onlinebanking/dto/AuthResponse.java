package com.onlinebanking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
    public AuthResponse withoutRefreshToken() {
        return new AuthResponse(
                userId,
                username,
                role,
                token,
                null,
                sessionId,
                expiresIn,
                refreshExpiresIn,
                message
        );
    }
}
