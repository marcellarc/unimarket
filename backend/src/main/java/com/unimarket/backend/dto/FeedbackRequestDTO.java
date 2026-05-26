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
    @NotNull(message = "Cliente é obrigatório")
    private Long clientId;

    // ID do produto avaliado
    @NotNull(message = "Produto é obrigatório")
    private Long productId;

    // ID do mercado onde o produto foi avaliado
    @NotNull(message = "Mercado é obrigatório")
    private Long marketId;

    // Nota de avaliação do produto.
    @NotNull(message = "Nota e obrigatoria")
    @Min(value = 1, message = "Nota deve ser no mínimo 1")
    @Max(value = 5, message = "Nota deve ser no máximo 5")
    private Integer vlNota;

    // comentário obrigatório do cliente
    @NotBlank(message = "Comentário é obrigatório")
    @Size(max = 500, message = "Comentário deve ter no máximo 500 caracteres")
    private String dsComentario;
}
