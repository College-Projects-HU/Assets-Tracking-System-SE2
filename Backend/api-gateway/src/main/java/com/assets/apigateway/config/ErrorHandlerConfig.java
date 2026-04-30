package com.assets.apigateway.config;

import com.assets.apigateway.exception.GlobalErrorWebExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ErrorHandlerConfig {

    @Bean
    public GlobalErrorWebExceptionHandler globalErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                                                         WebProperties webProperties,
                                                                         ErrorProperties errorProperties,
                                                                         ApplicationContext applicationContext) {
        return new GlobalErrorWebExceptionHandler(
                errorAttributes,
                webProperties.getResources(),
                errorProperties,
                applicationContext
        );
    }
}
