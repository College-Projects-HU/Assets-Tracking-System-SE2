package com.assets.authservice.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter implements Filter {
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long WINDOW_SIZE_MS = TimeUnit.MINUTES.toMillis(1);
    private static final ConcurrentHashMap<String, RequestTracker> trackerMap = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String path = httpRequest.getRequestURI();
        
        // Apply rate limiting only to auth endpoints
        if (isRateLimitedEndpoint(path)) {
            String clientId = getClientIdentifier(httpRequest);
            
            if (!isRequestAllowed(clientId)) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.getWriter().write("{\"error\": \"Rate limit exceeded. Max " + MAX_REQUESTS_PER_MINUTE + " requests per minute.\"}");
                return;
            }
        }
        
        chain.doFilter(request, response);
    }

    private boolean isRateLimitedEndpoint(String path) {
        return path.contains("/api/auth/login") || 
               path.contains("/api/auth/register") ||
               path.contains("/api/auth/refresh");
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        return clientIp;
    }

    private boolean isRequestAllowed(String clientId) {
        long currentTime = System.currentTimeMillis();
        RequestTracker tracker = trackerMap.computeIfAbsent(clientId, k -> new RequestTracker());
        
        // Clean old requests outside the window
        tracker.requests.removeIf(timestamp -> (currentTime - timestamp) > WINDOW_SIZE_MS);
        
        if (tracker.requests.size() < MAX_REQUESTS_PER_MINUTE) {
            tracker.requests.add(currentTime);
            return true;
        }
        
        return false;
    }

    private static class RequestTracker {
        final java.util.concurrent.CopyOnWriteArrayList<Long> requests = new java.util.concurrent.CopyOnWriteArrayList<>();
    }
}
