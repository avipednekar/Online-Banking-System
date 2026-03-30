package com.onlinebanking.service;

import com.onlinebanking.dto.AuthResponse;
import com.onlinebanking.exception.BusinessException;
import com.onlinebanking.model.BankUser;
import com.onlinebanking.model.UserSession;
import com.onlinebanking.repository.UserSessionRepository;
import com.onlinebanking.security.JwtService;
import com.onlinebanking.security.crypto.SensitiveDataCrypto;
import com.onlinebanking.util.IdentifierGenerator;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class UserSessionService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public UserSessionService(UserSessionRepository userSessionRepository,
                              JwtService jwtService,
                              @Value("${app.jwt.expiration-ms}") long accessExpirationMs,
                              @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.userSessionRepository = userSessionRepository;
        this.jwtService = jwtService;
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @Transactional
    public AuthResponse issueSession(BankUser user,
                                     String message,
                                     String ipAddress,
                                     String deviceFingerprint) {
        String sessionId = IdentifierGenerator.newId("SES");
        String tokenId = IdentifierGenerator.newId("JTI");
        String refreshToken = generateOpaqueToken();
        userSessionRepository.save(new UserSession(
                sessionId,
                tokenId,
                user,
                hashRefreshToken(refreshToken),
                defaultIfBlank(deviceFingerprint, "unknown-device"),
                defaultIfBlank(ipAddress, "unknown-ip"),
                LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L)
        ));
        return buildAuthResponse(user, message, sessionId, tokenId, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        UserSession session = userSessionRepository.findByRefreshTokenHash(hashRefreshToken(refreshToken))
                .orElseThrow(() -> new BusinessException("Invalid refresh token"));
        if (!session.isActive()) {
            throw new BusinessException("Refresh session is no longer active");
        }
        String tokenId = IdentifierGenerator.newId("JTI");
        String nextRefreshToken = generateOpaqueToken();
        session.rotate(
                tokenId,
                hashRefreshToken(nextRefreshToken),
                LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L)
        );
        return buildAuthResponse(session.getUser(), "Session refreshed successfully", session.getSessionId(), tokenId, nextRefreshToken);
    }

    @Transactional
    public void revoke(String refreshToken) {
        userSessionRepository.findByRefreshTokenHash(hashRefreshToken(refreshToken))
                .ifPresent(UserSession::revoke);
    }

    private AuthResponse buildAuthResponse(BankUser user,
                                           String message,
                                           String sessionId,
                                           String tokenId,
                                           String refreshToken) {
        return new AuthResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                jwtService.generateToken(user, sessionId, tokenId),
                refreshToken,
                sessionId,
                accessExpirationMs,
                refreshExpirationMs,
                message
        );
    }

    private String generateOpaqueToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashRefreshToken(String refreshToken) {
        return SensitiveDataCrypto.lookupHash(refreshToken);
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
