package com.assets.maintenanceservice.security;

public record AuthenticatedUser(Long userId, String email, String role) {}
