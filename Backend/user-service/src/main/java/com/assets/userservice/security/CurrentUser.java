package com.assets.userservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {}

    public static AuthenticatedUser get() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        return principal instanceof AuthenticatedUser user ? user : null;
    }

    public static Long id() {
        var user = get();
        if (user != null) {
            return user.userId();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? null : 0L;
    }

    public static String role() {
        var user = get();
        if (user != null) {
            return user.role();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().isEmpty()) {
            return null;
        }
        return authentication.getAuthorities().iterator().next().getAuthority();
    }
}
