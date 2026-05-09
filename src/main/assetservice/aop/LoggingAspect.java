package com.assets.assetservice.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(com.assets.assetservice.controller..*)")
    public void controllerLayer() {}

    @Pointcut("within(com.assets.assetservice.service..*)")
    public void serviceLayer() {}

    @Around("controllerLayer() || serviceLayer()")
    public Object logAround(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        String sig = pjp.getSignature().toShortString();
        log.debug(">> {}", sig);
        try {
            Object result = pjp.proceed();
            log.debug("<< {} ({} ms)", sig, System.currentTimeMillis() - start);
            return result;
        } catch (Throwable t) {
            log.warn("!! {} threw {}: {}", sig, t.getClass().getSimpleName(), t.getMessage());
            throw t;
        }
    }
: {}", jp.getSignature().toShortString(), ex.getMessage());
    }
}
