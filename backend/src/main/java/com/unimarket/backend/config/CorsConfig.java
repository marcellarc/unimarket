package com.unimarket.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                "http://localhost:*",
                                "http://127.0.0.1:*",
                                "https://unimarket-app.vercel.app",
                                "https://unimarket-marcellarcs-projects.vercel.app",
                                "https://unimarket-git-production-marcellarcs-projects.vercel.app",
                                "https://unimarket-develop.vercel.app",
                                "https://unimarket-git-develop-marcellarcs-projects.vercel.app",
                                "https://unimarket-develop.app",
                                "https://*.vercel.app"
                        )
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
