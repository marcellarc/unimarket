package com.unimarket.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o mercado envia para atualizar preço e estoque de um produto
@Getter
@Setter
public class MarketProductRequestDTO {

    // preço do produto — obrigatório e maior que zero
    @NotNull(message = "Preço é obrigatório")
    @Min(value = 0, message = "Preço não pode ser negativo")
    private Double price;

    // quantidade em estoque — obrigatório e maior ou igual a zero
    @NotNull(message = "Estoque é obrigatório")
    @Min(value = 0, message = "Estoque não pode ser negativo")
    private Integer stockQuantity;
}
