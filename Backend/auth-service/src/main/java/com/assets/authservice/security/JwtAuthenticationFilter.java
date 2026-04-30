package com.assets.authservice.security;

import com.assets.authservice.repository.BlacklistedTokenRepository;
import com.assets.authservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // Check if token is blacklisted
            if (blacklistedTokenRepository.existsByToken(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been blacklisted");
                return;
            }

            // Validate token
            if (jwtService.validateToken(token)) {
                String email = jwtService.getEmailFromToken(token);
                request.setAttribute("email", email);
                request.setAttribute("token", token);
            }
        }

        filterChain.doFilter(request, response);
    }
}
