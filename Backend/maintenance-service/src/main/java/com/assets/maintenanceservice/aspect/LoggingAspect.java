package com.assets.maintenanceservice.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(com.assets.maintenanceservice.controller..*) || within(com.assets.maintenanceservice.service.impl..*)")
    public void applicationPackagePointcut() {
        // Method is empty as this is just a Pointcut
    }

    @Around("applicationPackagePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getDeclaringType().getSimpleName() + "." + joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        log.info("[{}] START | params: {}", methodName, Arrays.toString(args));
        
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            
            log.info("[{}] END | returned: {} | duration: {}ms", methodName, result, duration);
            return result;
        } catch (IllegalArgumentException e) {
            log.error("[{}] ILLEGAL ARGUMENT: {} in {}()", methodName, Arrays.toString(args), joinPoint.getSignature().getName());
            throw e;
        } catch (Exception e) {
            log.error("[{}] EXCEPTION: {}", methodName, e.getMessage());
            throw e;
        }
    }
}
