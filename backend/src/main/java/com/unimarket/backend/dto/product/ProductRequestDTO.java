package com.unimarket.backend.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o mercado envia para cadastrar um produto
@Getter
@Setter
public class ProductRequestDTO {

    // nome do produto
    private String productName;

    // marca do produto
    private String brand;

    // descrição detalhada do produto
    private String description;

    // URL ou caminho da imagem do produto
    private String imageUrl;

    // ID da categoria à qual o produto pertence
    private Long categoryId;

    // código de barras — usado para evitar duplicatas no cadastro
    // código de barras — deve ter exatamente 13 dígitos numéricos
    @NotBlank(message = "Código de barras é obrigatório")
    @Pattern(regexp = "\\d{13}", message = "Código de barras deve conter exatamente 13 dígitos numéricos")
    private String barCode;
}
