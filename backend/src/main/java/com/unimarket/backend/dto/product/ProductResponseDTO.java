package com.unimarket.backend.dto.product;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após o cadastro ou consulta de um produto
@Getter
@Setter
public class ProductResponseDTO {

    // identificador gerado pelo banco
    private Long productId;

    // nome do produto
    private String productName;

    // marca do produto
    private String brand;

    // descrição detalhada do produto
    private String description;

    // URL ou caminho da imagem do produto
    private String imageUrl;

    // nome da categoria para exibição (evita expor só o ID)
    private String categoryName;

    // código de barras do produto
    private String barCode;

    // data em que o produto foi cadastrado no sistema
    private LocalDate createdAt;
}
