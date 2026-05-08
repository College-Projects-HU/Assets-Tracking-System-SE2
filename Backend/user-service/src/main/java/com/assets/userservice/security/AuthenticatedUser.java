package com.assets.userservice.security;

public record AuthenticatedUser(Long userId, String email, String role) {}
