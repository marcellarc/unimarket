package com.unimarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados de um vínculo produto-mercado para a listagem geral
@Getter
@Setter
public class MarketProductSummaryDTO {

    // identificador do vínculo
    private Long marketProductId;

    // dados do produto
    private String productName;
    private String brand;
    private String description;
    private String imageUrl;
    private String barCode;
    private String categoryName;

    // dados do mercado
    private String marketName;
    private String streetAddress;
    private String neighborhood;

    // preço e estoque praticados pelo mercado
    private Double price;
    private Integer stockQuantity;
}