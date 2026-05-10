package com.assets.assetservice.aspect;

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

    private final com.assets.assetservice.client.ReportServiceClient reportServiceClient;

    @Pointcut("execution(* com.assets.assetservice.controller..*(..))")
    public void controllerMethods() {}

    @Pointcut("execution(* com.assets.assetservice.service..*(..))")
    public void serviceMethods() {}

    @AfterReturning(pointcut = "auditActions()", returning = "result")
    public void auditAction(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String actor = getCurrentActor();
        String action = getActionLabel(methodName);
        String resourceType = getResourceType(methodName);
        String resourceId = extractResourceId(joinPoint.getArgs(), result);
        String details = buildDetails(joinPoint, result);

        try {
            reportServiceClient.logAudit(
                    new com.assets.assetservice.client.ReportServiceClient.AuditLogRequest(
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

    @Pointcut("execution(* com.assets.assetservice.controller..*.create*(..)) || " +
            "execution(* com.assets.assetservice.controller..*.update*(..)) || " +
            "execution(* com.assets.assetservice.controller..*.delete*(..)) || " +
            "execution(* com.assets.assetservice.controller..*.bulkImport*(..)) || " +
            "execution(* com.assets.assetservice.controller..*.assign*(..)) || " +
            "execution(* com.assets.assetservice.controller..*.return*(..))")
    public void auditActions() {}

    @Around("controllerMethods() || serviceMethods()")
    public Object logMethodExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        long startTime = System.currentTimeMillis();
        log.info("[{}.{}] START | params: {}", className, methodName, Arrays.toString(args));

        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            log.info("[{}.{}] END | returned: {} | duration: {}ms", className, methodName, result, duration);
            return result;
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}.{}] ERROR after {}ms | exception: {}", className, methodName, duration, ex.getMessage(), ex);
            throw ex;
        }
    }

    private String getCurrentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()
                || "anonymousUser".equalsIgnoreCase(auth.getName())
                || "anonymous".equalsIgnoreCase(auth.getName())) {
            return "System";
        }
        return auth.getName();
    }

    private String getActionLabel(String methodName) {
        if (methodName.startsWith("create")) return "Created";
        if (methodName.startsWith("update")) return "Updated";
        if (methodName.startsWith("delete")) return "Deleted";
        if (methodName.startsWith("bulkImport")) return "Bulk Imported";
        if (methodName.startsWith("assign")) return "Assigned";
        if (methodName.startsWith("return")) return "Returned";
        return "Executed";
    }

    private String getResourceType(String methodName) {
        if (methodName.startsWith("assign") || methodName.startsWith("return")) {
            return "Assignment";
        }
        return "Asset";
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
        Object body = null;
        if (result instanceof ResponseEntity<?>) {
            body = ((ResponseEntity<?>) result).getBody();
        }

        if ("createAsset".equals(methodName)) {
            String name     = getStr(body, "getName");
            String category = getStr(body, "getCategory");
            String location = getStr(body, "getLocation");
            return "Asset '" + nvl(name) + "' (" + nvl(category) + ")"
                    + (location != null ? " at " + location : "") + " added to inventory.";
        }
        if ("updateAsset".equals(methodName)) {
            String name     = getStr(body, "getName");
            String category = getStr(body, "getCategory");
            String status   = getStr(body, "getStatus");
            return "Asset '" + nvl(name) + "' (" + nvl(category) + ") updated. Status: " + nvl(status) + ".";
        }
        if ("deleteAsset".equals(methodName)) {
            return "Asset ID " + (args.length > 0 ? args[0] : "?") + " permanently deleted.";
        }
        if ("updateAssetStatus".equals(methodName)) {
            Object id     = args.length > 0 ? args[0] : "?";
            Object status = args.length > 1 ? args[1] : "?";
            String name   = getStr(body, "getName");
            return "Asset" + (name != null ? " '" + name + "'" : " ID " + id)
                    + " status changed to " + status + ".";
        }
        if ("bulkImportAssets".equals(methodName)) {
            if (body instanceof java.util.Map) {
                java.util.Map<?, ?> m = (java.util.Map<?, ?>) body;
                Object imported = m.get("imported");
                Object failed   = m.get("failed");
                return "Bulk import: " + (imported != null ? imported : "?") + " assets imported"
                        + (failed != null && !Integer.valueOf(0).equals(failed) ? ", " + failed + " failed" : "") + ".";
            }
            return "Bulk asset import completed.";
        }
        if ("assignAsset".equals(methodName)) {
            String assetId   = getStr(body, "getAssetId");
            String assetName = getStr(body, "getAssetName");
            String userName  = getStr(body, "getUserName");
            return "Asset" + (assetName != null ? " '" + assetName + "'" : " ID " + nvl(assetId))
                    + " assigned to " + nvl(userName) + ".";
        }
        if ("returnAsset".equals(methodName)) {
            String assetId   = getStr(body, "getAssetId");
            String assetName = getStr(body, "getAssetName");
            String userName  = getStr(body, "getUserName");
            return "Asset" + (assetName != null ? " '" + assetName + "'" : " ID " + nvl(assetId))
                    + " returned" + (userName != null ? " from " + userName : "") + ".";
        }
        return methodName + " completed.";
    }

    private String getStr(Object obj, String getter) {
        if (obj == null) return null;
        try {
            Object val = obj.getClass().getMethod(getter).invoke(obj);
            return val != null ? val.toString() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String nvl(String value) {
        return value != null ? value : "unknown";
    }
}
