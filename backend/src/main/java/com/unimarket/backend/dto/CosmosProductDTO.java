package com.unimarket.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

// DTO que representa a resposta da API Cosmos para um produto
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true) // ignora campos que não mapeamos
public class CosmosProductDTO {

    // descrição do produto
    private String description;

    // URL da imagem do produto
    private String thumbnail;

    // código de barras do produto
    private String gtin;

    // preço médio do produto
    @JsonProperty("avg_price")
    private Double avgPrice;

    // marca do produto
    private BrandDTO brand;

    // categoria do produto
    private GpcDTO gpc;

    // DTO interno representando a marca
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BrandDTO {
        private String name;
        private String picture;
    }

    // DTO interno representando a categoria
    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GpcDTO {
        private String code;
        private String description;
    }
}
