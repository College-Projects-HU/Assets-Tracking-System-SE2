package com.assets.authservice;

import com.assets.authservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@RequiredArgsConstructor
public class AuthServiceApplication {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}


