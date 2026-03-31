package com.onlinebanking.security;

import com.onlinebanking.model.BankUser;
import com.onlinebanking.repository.BankUserRepository;
import com.onlinebanking.service.UserSessionService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final BankUserRepository bankUserRepository;
    private final SecurityErrorResponseWriter securityErrorResponseWriter;
    private final UserSessionService userSessionService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   BankUserRepository bankUserRepository,
                                   SecurityErrorResponseWriter securityErrorResponseWriter,
                                   UserSessionService userSessionService) {
        this.jwtService = jwtService;
        this.bankUserRepository = bankUserRepository;
        this.securityErrorResponseWriter = securityErrorResponseWriter;
        this.userSessionService = userSessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        Claims claims;
        String username;
        try {
            claims = jwtService.parseClaims(token);
            username = claims.getSubject();
        } catch (Exception exception) {
            log.warn("JWT parsing failed for path {}: {}", request.getRequestURI(), exception.getMessage());
            securityErrorResponseWriter.write(request, response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            BankUser user = bankUserRepository.findByUsernameIgnoreCase(username).orElse(null);
            String sessionId = claims.get("sid", String.class);
            String tokenId = claims.getId();
            if (user != null
                    && jwtService.isTokenValid(claims, user.getUsername())
                    && userSessionService.isAccessTokenSessionValid(sessionId, tokenId, user.getUsername())) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                log.warn("JWT session validation failed for user {}", username);
                securityErrorResponseWriter.write(request, response, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
