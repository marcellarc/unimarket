package com.unimarket.backend.dto.shoppingList;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o cliente envia para criar uma lista de compras
@Getter
@Setter
public class ShoppingListRequestDTO {

    // nome da lista — obrigatório
    @NotBlank(message = "Nome da lista é obrigatório")
    private String name;
}