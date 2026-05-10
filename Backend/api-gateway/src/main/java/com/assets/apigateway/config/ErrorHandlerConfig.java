package com.assets.apigateway.config;

import com.assets.apigateway.exception.GlobalErrorWebExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.web.ErrorProperties;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.boot.web.reactive.error.ErrorAttributes;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.codec.ServerCodecConfigurer;
import org.springframework.web.reactive.result.view.ViewResolver;

import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class ErrorHandlerConfig {

    @Bean
    public ErrorProperties errorProperties() {
        return new ErrorProperties();
    }

    @Bean
    public GlobalErrorWebExceptionHandler globalErrorWebExceptionHandler(ErrorAttributes errorAttributes,
                                                                         WebProperties webProperties,
                                                                         ErrorProperties errorProperties,
                                                                         ApplicationContext applicationContext,
                                                                         ServerCodecConfigurer serverCodecConfigurer,
                                                                         ObjectProvider<ViewResolver> viewResolvers) {
        GlobalErrorWebExceptionHandler handler = new GlobalErrorWebExceptionHandler(
                errorAttributes,
                webProperties.getResources(),
                errorProperties,
                applicationContext
        );
        handler.setMessageWriters(serverCodecConfigurer.getWriters());
        handler.setMessageReaders(serverCodecConfigurer.getReaders());
        handler.setViewResolvers(viewResolvers.orderedStream().collect(Collectors.toList()));
        return handler;
    }
}
