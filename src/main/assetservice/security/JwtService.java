package com.assets.assetservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

@Service
public class JwtService {
    @Value("${jwt.secret}") private String secret;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes()); }

    public Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody();
    }

    public boolean isValid(String token) {
        try { parse(token); return true; } catch (Exception e) { return false; }
    }

    public String email(String token) { return parse(token).getSubject(); }
    public Long userId(String token) {
        Object v = parse(token).get("userId");
        return v instanceof Number n ? n.longValue() : null;
    }
    public String role(String token) {
        Object v = parse(token).get("role");
        return v == null ? null : v.toString();
    }
}
