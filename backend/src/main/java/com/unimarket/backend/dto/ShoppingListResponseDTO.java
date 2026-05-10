package com.unimarket.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após criar ou consultar uma lista de compras
@Getter
@Setter
public class ShoppingListResponseDTO {

    // identificador da lista
    private Long id;

    // nome da lista
    private String name;

    // nome do cliente dono da lista
    private String clientName;

    // data de criação da lista
    private LocalDateTime createdAt;

    // data da última atualização da lista
    private LocalDateTime updatedAt;
}
