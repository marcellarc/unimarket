package com.unimarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após adicionar ou consultar um item da lista
@Getter
@Setter
public class ShoppingListItemResponseDTO {

    // identificador do item
    private Long id;

    // nome do produto
    private String productName;

    // nome do mercado
    private String marketName;

    // preço do produto no mercado
    private Double price;

    // quantidade do produto na lista
    private Integer quantity;
}
