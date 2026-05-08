package com.assets.authservice.controller;

import com.assets.authservice.entity.Role;
import com.assets.authservice.entity.User;
import com.assets.authservice.repository.RoleRepository;
import com.assets.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal/auth")
@RequiredArgsConstructor
public class InternalAuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/by-email")
    public ResponseEntity<User> getUserByEmail(@RequestParam("email") String email) {
        return userRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{email}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable("email") String email, @RequestBody Map<String, String> updates) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (updates.containsKey("fullName")) {
            user.setFullName(updates.get("fullName"));
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable("id") Long id, @RequestParam("roleName") String roleName) {
        User user = userRepository.findById(id).orElseThrow();
        Role role = roleRepository.findByName(roleName).orElseThrow();
        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateStatus(@PathVariable("id") Long id, @RequestParam("enabled") boolean enabled) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(enabled);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
