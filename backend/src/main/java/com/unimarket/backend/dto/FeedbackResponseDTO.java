package com.unimarket.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após criar, atualizar ou consultar um feedback.
@Getter
@Setter
public class FeedbackResponseDTO {

    // identificador do feedback
    private Long id;

    // cliente que realizou o feedback
    private Long clientId;
    private String clientName;
    private String clientProfileImageUrl;

    // produto avaliado
    private Long productId;
    private String productName;

    // mercado onde o produto foi avaliado
    private Long marketId;
    private String marketName;

    // Nota e comentário da avaliação.
    private Integer vlNota;
    private String dsComentario;

    // resposta do mercado ao feedback
    private String marketReply;
    private LocalDateTime marketRepliedAt;

    // data de criacao do feedback
    private LocalDateTime createdAt;
}
