package com.unimarket.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o mercado envia para cadastrar um produto
@Getter
@Setter
public class ProductRequestDTO {

    // nome do produto
    //@NotBlank(message = "Nome do produto é obrigatório")
    private String productName;

    // marca do produto
    //@NotBlank(message = "Marca do produto é obrigatória")
    private String brand;

    // descrição detalhada do produto
    private String description;

    // URL ou caminho da imagem do produto
    private String imageUrl;

    // ID da categoria a qual o produto pertence.
    // Opcional quando a API Cosmos retorna a categoria pelo codigo de barras.
    private Long categoryId;

    // código de barras — usado para evitar duplicatas no cadastro (opcional)
    private String barCode;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    private Double price;

    @NotNull(message = "Estoque é obrigatório")
    @Min(value = 0, message = "Estoque não pode ser negativo")
    private Integer stockQuantity;
}
