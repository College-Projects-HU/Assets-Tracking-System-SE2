package com.assets.apigateway.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@Slf4j
public class JwtAuthenticationFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationFilterFactory.Config> {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public JwtAuthenticationFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();

            // Skip auth validation for public endpoints
            if (isPublicEndpoint(path)) {
                log.info("Public endpoint accessed: {}", path);
                return chain.filter(exchange);
            }

            // Extract and validate JWT token
            String authHeader = request.getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header for: {}", path);
                return onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            JwtClaims claims = extractClaims(token);

            // Validate token (you can add more sophisticated validation here)
            if (!isValidToken(token) || claims.email == null || claims.email.isBlank()) {
                log.warn("Invalid token for: {}", path);
                return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            // Add token to downstream headers
            ServerHttpRequest.Builder requestBuilder = request.mutate()
                    .header("X-Token", token)
                    .header("X-User-Email", claims.email);

            if (claims.role != null && !claims.role.isBlank()) {
                requestBuilder.header("X-User-Role", claims.role);
            }
            if (claims.userId != null && !claims.userId.isBlank()) {
                requestBuilder.header("X-User-Id", claims.userId);
            }

            ServerHttpRequest modifiedRequest = requestBuilder.build();

            ServerWebExchange modifiedExchange = exchange.mutate().request(modifiedRequest).build();
            log.info("Token validated successfully for: {}", path);
            return chain.filter(modifiedExchange);
        };
    }

    private boolean isPublicEndpoint(String path) {
        return path.contains("/api/auth/register") ||
               path.contains("/api/auth/login") ||
               path.contains("/api/auth/refresh") ||
               path.contains("/actuator");
    }

    private boolean isValidToken(String token) {
        // Basic validation: check if token is not empty and has reasonable length
        // In production, you should validate JWT signature, expiration, etc.
        return token != null && !token.isEmpty() && token.length() > 20;
    }

    private JwtClaims extractClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return new JwtClaims(null, null, null);
            }

            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payload = OBJECT_MAPPER.readTree(new String(decodedPayload, StandardCharsets.UTF_8));
            String email = payload.path("sub").asText(null);
            String role = payload.path("role").asText(null);
            String userId = payload.path("userId").asText(null);
            return new JwtClaims(email, role, userId);
        } catch (Exception ex) {
            log.warn("Failed to parse JWT payload", ex);
            return new JwtClaims(null, null, null);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");

        String errorBody = "{\"status\":" + status.value() + ",\"message\":\"" + message + "\"}";
        return response.writeWith(Mono.just(response.bufferFactory().wrap(errorBody.getBytes())));
    }

    public static class Config {
        // Configuration properties if needed
    }

    private static class JwtClaims {
        private final String email;
        private final String role;
        private final String userId;

        private JwtClaims(String email, String role, String userId) {
            this.email = email;
            this.role = role;
            this.userId = userId;
        }
    }
}
