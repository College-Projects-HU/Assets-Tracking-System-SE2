package com.assets.assetservice.security;

public record AuthenticatedUser(Long userId, String email, String role) {}
