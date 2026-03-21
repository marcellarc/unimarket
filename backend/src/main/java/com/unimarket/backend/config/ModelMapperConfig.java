package com.unimarket.backend.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do ModelMapper.
 *
 * Responsável por disponibilizar um Bean que permite a conversão automática
 * entre DTOs e Entities dentro da aplicação.
 *
 * Exemplo de uso:
 * - Converter SupermercadoDTO → Supermercado (Entity)
 * - Converter Entity → ResponseDTO
 */
@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}