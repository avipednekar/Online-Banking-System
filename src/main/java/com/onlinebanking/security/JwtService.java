package com.onlinebanking.security;

import com.onlinebanking.model.BankUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalArgumentException("JWT secret must contain at least 32 characters");
        }
        byte[] keyBytes = secret.trim().getBytes(StandardCharsets.UTF_8);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public String generateToken(BankUser user) {
        return generateToken(user, null, null);
    }

    public String generateToken(BankUser user, String sessionId, String tokenId) {
        Date issuedAt = new Date();
        Date expiry = new Date(issuedAt.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(issuedAt)
                .expiration(expiry)
                .signWith(secretKey);
        if (sessionId != null) {
            builder.claim("sid", sessionId);
        }
        if (tokenId != null) {
            builder.id(tokenId);
        }
        return builder.compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, String username) {
        return isTokenValid(parseClaims(token), username);
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public String extractTokenId(String token) {
        return parseClaims(token).getId();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(Claims claims, String username) {
        return claims.getSubject().equals(username) && claims.getExpiration().after(new Date());
    }
}
