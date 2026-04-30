package com.unimarket.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI unimarketOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("UniMarket API")
                        .description("Documentacao oficial da API do UniMarket para autenticacao, clientes, mercados e alertas.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Equipe UniMarket")
                                .email("suporte@unimarket.local"))
                        .license(new License()
                                .name("Uso academico e interno")));
    }
}
