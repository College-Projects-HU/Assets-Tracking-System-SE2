package com.assets.maintenanceservice.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final com.assets.maintenanceservice.client.ReportServiceClient reportServiceClient;

    @Pointcut("within(com.assets.maintenanceservice.controller..*) || within(com.assets.maintenanceservice.service.impl..*)")
    public void applicationPackagePointcut() {
        // Method is empty as this is just a Pointcut
    }

    @AfterReturning(pointcut = "auditActions()", returning = "result")
    public void auditAction(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String actor = getCurrentActor();
        String action = getActionLabel(methodName);
        String resourceType = "MaintenanceTicket";
        String resourceId = extractResourceId(joinPoint.getArgs(), result);
        String details = buildDetails(joinPoint, result);

        try {
            reportServiceClient.logAudit(
                    new com.assets.maintenanceservice.client.ReportServiceClient.AuditLogRequest(
                            actor,
                            action,
                            details,
                            resourceType,
                            resourceId
                    )
            );
        } catch (Exception ex) {
            log.warn("Audit log publish failed for {}: {}", methodName, ex.getMessage());
        }
    }

    @Pointcut("execution(* com.assets.maintenanceservice.controller..*.create*(..)) || " +
            "execution(* com.assets.maintenanceservice.controller..*.update*(..)) || " +
            "execution(* com.assets.maintenanceservice.controller..*.add*(..))")
    public void auditActions() {
        // Match maintenance create/update note operations
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

    private String getCurrentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getName() != null ? auth.getName() : "anonymous";
    }

    private String getActionLabel(String methodName) {
        if (methodName.startsWith("create")) return "Created";
        if (methodName.startsWith("update")) return "Updated";
        if (methodName.startsWith("add")) return "Updated";
        return "Executed";
    }

    private String extractResourceId(Object[] args, Object result) {
        if (result instanceof ResponseEntity<?>) {
            Object body = ((ResponseEntity<?>) result).getBody();
            String id = tryExtractId(body);
            if (id != null) {
                return id;
            }
        }
        if (args != null) {
            for (Object arg : args) {
                if (arg instanceof Long) {
                    return String.valueOf(arg);
                }
                String id = tryExtractId(arg);
                if (id != null) {
                    return id;
                }
            }
        }
        return null;
    }

    private String tryExtractId(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            Method getter = obj.getClass().getMethod("getId");
            Object id = getter.invoke(obj);
            return id != null ? id.toString() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String buildDetails(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        if (methodName.equals("createTicket") && args.length > 0) {
            return "New maintenance ticket created with request: " + args[0];
        }
        if (methodName.equals("updateTicketStatus") && args.length > 0) {
            return "Updated ticket " + args[0] + " status.";
        }
        if (methodName.equals("addNotes") && args.length > 0) {
            return "Added notes to ticket " + args[0] + ".";
        }
        if (args != null && args.length > 0) {
            return "Arguments: " + Arrays.toString(args);
        }
        return "Maintenance action completed.";
    }
}
