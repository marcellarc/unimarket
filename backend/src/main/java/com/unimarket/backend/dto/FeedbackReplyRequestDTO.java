package com.unimarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// DTO com a resposta que o mercado envia para um feedback
@Getter
@Setter
public class FeedbackReplyRequestDTO {

    @NotBlank(message = "Resposta e obrigatoria")
    @Size(max = 500, message = "Resposta deve ter no maximo 500 caracteres")
    private String reply;
}
