package com.assets.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "auth-service", url = "${feign.auth-service.url:http://localhost:8081}")
public interface AuthUserClient {
    @GetMapping("/api/internal/users")
    List<AuthUserDto> getAllUsers();

    @GetMapping("/api/internal/users/{id}")
    AuthUserDto getUser(@PathVariable("id") Long id);

    @PutMapping("/api/internal/users/{id}/profile")
    AuthUserDto updateProfile(@PathVariable("id") Long id, @RequestBody ProfileUpdateRequest request);

    @PutMapping("/api/internal/users/{id}/role")
    AuthUserDto updateRole(@PathVariable("id") Long id, @RequestBody RoleUpdateRequest request);

    @DeleteMapping("/api/internal/users/{id}")
    void deactivate(@PathVariable("id") Long id);

    record ProfileUpdateRequest(String fullName) {}
    record RoleUpdateRequest(String role) {}

    class AuthUserDto {
        public Long id;
        public String fullName;
        public String email;
        public String role;
        public boolean active;
    }
}
