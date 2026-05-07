package com.assets.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @GetMapping("/internal/auth/users")
    List<UserDTO> getAllUsers();

    @GetMapping("/internal/auth/users/by-email")
    UserDTO getUserByEmail(@RequestParam("email") String email);

    @PutMapping("/internal/auth/users/{email}/profile")
    UserDTO updateProfile(@PathVariable("email") String email, @RequestBody Map<String, String> updates);

    @PutMapping("/internal/auth/users/{id}/role")
    UserDTO updateRole(@PathVariable("id") Long id, @RequestParam("roleName") String roleName);

    @PutMapping("/internal/auth/users/{id}/status")
    UserDTO updateStatus(@PathVariable("id") Long id, @RequestParam("enabled") boolean enabled);

    class UserDTO {
        public Long id;
        public String fullName;
        public String email;
        public RoleDTO role;
        public Boolean enabled;
    }

    class RoleDTO {
        public Long id;
        public String name;
    }
}
