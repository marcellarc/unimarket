package com.unimarket.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o cliente envia para cadastrar ou atualizar um feedback
@Getter
@Setter
public class FeedbackRequestDTO {

    // ID do cliente que realizou o feedback
    @NotNull(message = "Cliente e obrigatorio")
    private Long clientId;

    // ID do produto avaliado
    @NotNull(message = "Produto e obrigatorio")
    private Long productId;

    // ID do mercado onde o produto foi avaliado
    @NotNull(message = "Mercado e obrigatorio")
    private Long marketId;

    // nota de avaliacao do produto
    @NotNull(message = "Nota e obrigatoria")
    @Min(value = 1, message = "Nota deve ser no minimo 1")
    @Max(value = 5, message = "Nota deve ser no maximo 5")
    private Integer vlNota;

    // comentario obrigatorio do cliente
    @NotBlank(message = "Comentario e obrigatorio")
    @Size(max = 500, message = "Comentario deve ter no maximo 500 caracteres")
    private String dsComentario;
}
