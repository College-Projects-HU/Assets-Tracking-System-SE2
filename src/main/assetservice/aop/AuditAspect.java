package com.assets.assetservice.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class AuditAspect {

    @Around("@annotation(com.assets.assetservice.aop.Auditable)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature ms = (MethodSignature) pjp.getSignature();
        Auditable a = ms.getMethod().getAnnotation(Auditable.class);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String user = auth != null ? auth.getName() : "anonymous";
        long t0 = System.currentTimeMillis();
        try {
            Object res = pjp.proceed();
            log.info("AUDIT user={} action={} method={} status=SUCCESS time={}ms",
                    user, a.action(), ms.toShortString(), System.currentTimeMillis() - t0);
            return res;
        } catch (Throwable ex) {
            log.warn("AUDIT user={} action={} method={} status=FAIL error={}",
                    user, a.action(), ms.toShortString(), ex.getMessage());
            throw ex;
        }
    }
}
