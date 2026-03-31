package com.onlinebanking.security;

import com.onlinebanking.dto.RefreshTokenRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RefreshTokenCookieService {

    private final String cookieName;
    private final boolean secureCookie;
    private final String sameSite;

    public RefreshTokenCookieService(
            @Value("${app.security.refresh-cookie-name:bank_refresh_token}") String cookieName,
            @Value("${app.security.refresh-cookie-secure:false}") boolean secureCookie,
            @Value("${app.security.refresh-cookie-same-site:Strict}") String sameSite) {
        this.cookieName = cookieName;
        this.secureCookie = secureCookie;
        this.sameSite = sameSite;
    }

    public void writeRefreshTokenCookie(jakarta.servlet.http.HttpServletResponse response,
                                        String refreshToken,
                                        long refreshExpiresInMs) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(cookieName, refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ofMillis(refreshExpiresInMs))
                .build()
                .toString());
    }

    public void clearRefreshTokenCookie(jakarta.servlet.http.HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(Duration.ZERO)
                .build()
                .toString());
    }

    public String resolveRefreshToken(HttpServletRequest request, RefreshTokenRequest refreshTokenRequest) {
        if (refreshTokenRequest != null && refreshTokenRequest.refreshToken() != null
                && !refreshTokenRequest.refreshToken().isBlank()) {
            return refreshTokenRequest.refreshToken().trim();
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue().trim();
            }
        }

        return null;
    }

    public String getCookieName() {
        return cookieName;
    }
}
