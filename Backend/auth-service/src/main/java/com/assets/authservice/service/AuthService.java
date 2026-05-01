package com.assets.authservice.service;

import com.assets.authservice.dto.AuthResponse;
import com.assets.authservice.dto.LoginRequest;
import com.assets.authservice.dto.RegisterRequest;
import com.assets.authservice.entity.BlacklistedToken;
import com.assets.authservice.entity.RefreshToken;
import com.assets.authservice.entity.Role;
import com.assets.authservice.entity.User;
import com.assets.authservice.exception.AuthException;
import com.assets.authservice.repository.BlacklistedTokenRepository;
import com.assets.authservice.repository.RefreshTokenRepository;
import com.assets.authservice.repository.RoleRepository;
import com.assets.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * PATCHED: passes the User entity to JwtService so userId/role claims are embedded.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new AuthException("User with this email already exists");

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new AuthException("Role not found: " + request.getRole()));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEnabled(true);
        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken).refreshToken(refreshToken)
                .tokenType("Bearer").expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new AuthException("Invalid email or password");
        if (!user.getEnabled()) throw new AuthException("User account is disabled");

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = generateAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken).refreshToken(refreshToken)
                .tokenType("Bearer").expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .build();
    }

    public AuthResponse refreshAccessToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new AuthException("Invalid refresh token"));
        if (token.getRevoked() || token.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new AuthException("Refresh token has expired or been revoked");

        User user = token.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken).refreshToken(refreshToken)
                .tokenType("Bearer").expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .build();
    }

    public void logout(String token, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AuthException("User not found"));
        BlacklistedToken bl = new BlacklistedToken();
        bl.setToken(token); bl.setUser(user);
        bl.setExpiryDate(jwtService.getExpirationDateFromToken(token).toInstant()
                .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        blacklistedTokenRepository.save(bl);
        Optional<RefreshToken> rt = refreshTokenRepository.findByToken(token);
        rt.ifPresent(r -> { r.setRevoked(true); refreshTokenRepository.save(r); });
    }

    private String generateAndSaveRefreshToken(User user) {
        String refreshToken = jwtService.generateRefreshToken(user);
        RefreshToken token = new RefreshToken();
        token.setToken(refreshToken); token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusDays(7));
        token.setRevoked(false);
        refreshTokenRepository.save(token);
        return refreshToken;
    }

    public boolean isTokenBlacklisted(String token) { return blacklistedTokenRepository.existsByToken(token); }
}
