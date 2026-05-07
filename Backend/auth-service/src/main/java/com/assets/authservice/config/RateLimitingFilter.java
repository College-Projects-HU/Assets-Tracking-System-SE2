package com.assets.authservice.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter implements Filter {

    private final Map<String, AtomicInteger> requestCountsPerIp = new ConcurrentHashMap<>();

    public RateLimitingFilter() {
        // Reset counts every minute
        Executors.newScheduledThreadPool(1).scheduleAtFixedRate(
                requestCountsPerIp::clear, 1, 1, TimeUnit.MINUTES);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if (req.getRequestURI().startsWith("/api/auth/")) {
            String clientIp = req.getRemoteAddr();
            requestCountsPerIp.putIfAbsent(clientIp, new AtomicInteger(0));
            int requests = requestCountsPerIp.get(clientIp).incrementAndGet();

            if (requests > 5) {
                res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                res.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
