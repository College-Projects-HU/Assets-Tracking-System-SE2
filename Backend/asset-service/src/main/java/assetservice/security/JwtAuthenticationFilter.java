package com.assets.assetservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            String token = h.substring(7);
            if (jwt.isValid(token)) {
                String email = jwt.email(token);
                String role = jwt.role(token);
                Long userId = jwt.userId(token);
                req.setAttribute("userId", userId);
                req.setAttribute("email", email);
                req.setAttribute("role", role);
                List<SimpleGrantedAuthority> auths = role == null
                        ? List.of() : List.of(new SimpleGrantedAuthority(role));
                var auth = new UsernamePasswordAuthenticationToken(
                        new AuthenticatedUser(userId, email, role), null, auths);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
