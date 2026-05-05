package com.unimarket.backend.dto.product;

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

    // ID da categoria à qual o produto pertence
    @NotNull(message = "Categoria é obrigatória")
    private Long categoryId;

    // código de barras — usado para evitar duplicatas no cadastro (opcional)
    private String barCode;
}
