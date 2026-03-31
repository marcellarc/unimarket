package com.unimarket.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults()) // Mantém a conexão com o Front-end aberta
            .csrf(csrf -> csrf.disable())    // Desabilita CSRF para permitir POSTs
            .authorizeHttpRequests(auth -> auth
                // 1. Rotas Públicas da sua API
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/api/markets/**").permitAll() // Rota de cadastro
                
                // 2. Rotas do Swagger (Documentação)
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // 3. Demais rotas (Liberadas temporariamente para desenvolvimento)
                // Quando formos proteger o sistema com JWT, trocaremos para .authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}