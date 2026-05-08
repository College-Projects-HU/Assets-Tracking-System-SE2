package com.assets.maintenanceservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;

    private Key key() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token).getBody();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long userId(String token) {
        Object value = parse(token).get("userId");
        return value instanceof Number number ? number.longValue() : null;
    }

    public String email(String token) {
        return parse(token).getSubject();
    }

    public String role(String token) {
        Object value = parse(token).get("role");
        return value == null ? null : value.toString();
    }
}
