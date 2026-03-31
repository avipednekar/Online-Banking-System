package com.onlinebanking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_sessions")
public class UserSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionId;

    @Column(nullable = false, unique = true)
    private String tokenId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private BankUser user;

    @Column(nullable = false, length = 128)
    private String refreshTokenHash;

    @Column(nullable = false)
    private String deviceFingerprint;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime lastUsedAt;

    private LocalDateTime revokedAt;

    public UserSession() {
    }

    public UserSession(String sessionId,
                       String tokenId,
                       BankUser user,
                       String refreshTokenHash,
                       String deviceFingerprint,
                       String ipAddress,
                       LocalDateTime expiresAt) {
        this.sessionId = sessionId;
        this.tokenId = tokenId;
        this.user = user;
        this.refreshTokenHash = refreshTokenHash;
        this.deviceFingerprint = deviceFingerprint;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now();
        this.lastUsedAt = this.createdAt;
        this.expiresAt = expiresAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getTokenId() {
        return tokenId;
    }

    public BankUser getUser() {
        return user;
    }

    public boolean matchesAccessToken(String tokenId) {
        return this.tokenId != null && this.tokenId.equals(tokenId);
    }

    public boolean isActive() {
        return revokedAt == null && expiresAt.isAfter(LocalDateTime.now());
    }

    public void touch() {
        this.lastUsedAt = LocalDateTime.now();
    }

    public void rotate(String tokenId, String refreshTokenHash, LocalDateTime expiresAt) {
        this.tokenId = tokenId;
        this.refreshTokenHash = refreshTokenHash;
        this.expiresAt = expiresAt;
        touch();
    }

    public void revoke() {
        this.revokedAt = LocalDateTime.now();
    }
}
