package com.assets.authservice.service;

import com.assets.authservice.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * PATCHED: now embeds userId (Long) and role (String) claims so downstream
 * services can authorize and audit without a Feign round-trip.
 */
@Service
public class JwtService {
    @Value("${jwt.secret:your_super_secret_key_that_should_be_at_least_256_bits_long_for_HS256_algorithm_in_production}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @Value("${jwt.refresh.expiration:604800000}")
    private long refreshTokenExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /** PATCHED signature: include userId + role. */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().getName());
        claims.put("fullName", user.getFullName());
        return createToken(claims, user.getEmail(), jwtExpirationMs);
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("type", "refresh");
        return createToken(claims, user.getEmail(), refreshTokenExpirationMs);
    }

    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) { return getClaimFromToken(token, Claims::getSubject); }
    public Long getUserIdFromToken(String token) {
        Object v = getAllClaimsFromToken(token).get("userId");
        if (v instanceof Number n) return n.longValue();
        return null;
    }
    public String getRoleFromToken(String token) {
        Object v = getAllClaimsFromToken(token).get("role");
        return v == null ? null : v.toString();
    }
    public Date getExpirationDateFromToken(String token) { return getClaimFromToken(token, Claims::getExpiration); }
    public <T> T getClaimFromToken(String token, Function<Claims, T> resolver) { return resolver.apply(getAllClaimsFromToken(token)); }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
    }

    public Boolean isTokenExpired(String token) {
        try { return getExpirationDateFromToken(token).before(new Date()); }
        catch (Exception e) { return true; }
    }

    public Boolean validateToken(String token) {
        try { Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token); return !isTokenExpired(token); }
        catch (Exception e) { return false; }
    }

    public long getAccessTokenExpirationMs() { return jwtExpirationMs; }
    public long getRefreshTokenExpirationMs() { return refreshTokenExpirationMs; }
}
