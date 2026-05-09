package com.assets.assetservice.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {}
    public static AuthenticatedUser get() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return null;
        Object p = a.getPrincipal();
        return p instanceof AuthenticatedUser u ? u : null;
    }
    public static Long id() { var u = get(); return u == null ? null : u.userId(); }
}
