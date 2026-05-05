package com.assets.apigateway.config;

import com.assets.apigateway.filter.JwtAuthenticationFilterFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    private final JwtAuthenticationFilterFactory jwtAuthenticationFilterFactory;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service routes - no JWT required
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://auth-service"))

                // Asset Service routes - JWT required
                .route("asset-service", r -> r
                        .path("/api/assets/**")
                        .filters(f -> f.filter(jwtAuthenticationFilterFactory.apply(new JwtAuthenticationFilterFactory.Config())))
                        .uri("lb://asset-service"))

                // User Service routes - JWT required
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.filter(jwtAuthenticationFilterFactory.apply(new JwtAuthenticationFilterFactory.Config())))
                        .uri("lb://user-service"))

                // Report Service routes - JWT required
                .route("report-service", r -> r
                        .path("/api/reports/**")
                        .filters(f -> f.filter(jwtAuthenticationFilterFactory.apply(new JwtAuthenticationFilterFactory.Config())))
                        .uri("lb://report-service"))

                // Maintenance Service routes - JWT required
                .route("maintenance-service", r -> r
                        .path("/api/maintenance/**")
                        .filters(f -> f.filter(jwtAuthenticationFilterFactory.apply(new JwtAuthenticationFilterFactory.Config())))
                        .uri("lb://maintenance-service"))

                // Notification Service routes - JWT required
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f.filter(jwtAuthenticationFilterFactory.apply(new JwtAuthenticationFilterFactory.Config())))
                        .uri("lb://notification-service"))

                .build();
    }
}
