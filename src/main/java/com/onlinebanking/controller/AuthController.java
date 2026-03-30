package com.onlinebanking.controller;

import com.onlinebanking.dto.ApiResponse;
import com.onlinebanking.dto.AuthResponse;
import com.onlinebanking.dto.LoginRequest;
import com.onlinebanking.dto.RefreshTokenRequest;
import com.onlinebanking.dto.RegisterRequest;
import com.onlinebanking.dto.UserProfileResponse;
import com.onlinebanking.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletRequest httpServletRequest) {
        AuthResponse response = authService.register(request, resolveIpAddress(httpServletRequest), resolveDeviceFingerprint(httpServletRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpServletRequest) {
        AuthResponse response = authService.login(request, resolveIpAddress(httpServletRequest), resolveDeviceFingerprint(httpServletRequest));
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshSession(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> me(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Current user profile fetched successfully",
                authService.getCurrentUser(authentication.getName())
        ));
    }

    private String resolveIpAddress(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveDeviceFingerprint(HttpServletRequest request) {
        String deviceId = request.getHeader("X-Device-Id");
        return deviceId == null || deviceId.isBlank() ? "web-client" : deviceId.trim();
    }
}
