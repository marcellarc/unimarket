package com.unimarket.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o cliente envia para adicionar um item à lista de compras
@Getter
@Setter
public class ShoppingListItemRequestDTO {

    // ID do vínculo mercado-produto — obrigatório
    @NotNull(message = "Produto do mercado é obrigatório")
    private Long marketProductId;

    // quantidade do produto — obrigatório e maior que zero
    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantity;
}
