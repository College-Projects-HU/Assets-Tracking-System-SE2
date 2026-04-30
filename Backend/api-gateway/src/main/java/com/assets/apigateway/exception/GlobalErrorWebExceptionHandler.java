package com.assets.apigateway.exception;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.autoconfigure.web.reactive.error.DefaultErrorWebExceptionHandler;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class GlobalErrorWebExceptionHandler extends DefaultErrorWebExceptionHandler {

    public GlobalErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                         WebProperties.Resources resources,
                                         ErrorProperties errorProperties,
                                         ApplicationContext applicationContext) {
        super(errorAttributes, resources, errorProperties, applicationContext);
    }

    @Override
    protected RouterFunction<ServerResponse> getRoutingFunction(ErrorAttributes errorAttributes) {
        return RouterFunctions.route(
                RequestPredicates.all(),
                request -> {
                    Throwable throwable = errorAttributes.getError(request);
                    log.error("Gateway error: ", throwable);

                    int statusCode = getHttpStatus(throwable).value();
                    Map<String, Object> body = new HashMap<>();
                    body.put("timestamp", LocalDateTime.now());
                    body.put("status", statusCode);
                    body.put("message", getErrorMessage(throwable));
                    body.put("path", request.path());

                    return ServerResponse
                            .status(getHttpStatus(throwable))
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(BodyInserters.fromValue(body));
                }
        );
    }

    private HttpStatus getHttpStatus(Throwable throwable) {
        if (throwable != null && throwable.getMessage() != null) {
            if (throwable.getMessage().contains("Unauthorized")) {
                return HttpStatus.UNAUTHORIZED;
            }
            if (throwable.getMessage().contains("Forbidden")) {
                return HttpStatus.FORBIDDEN;
            }
            if (throwable.getMessage().contains("Not Found")) {
                return HttpStatus.NOT_FOUND;
            }
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private String getErrorMessage(Throwable throwable) {
        if (throwable == null) {
            return "An error occurred";
        }
        return throwable.getMessage() != null ? throwable.getMessage() : throwable.getClass().getSimpleName();
    }
}
