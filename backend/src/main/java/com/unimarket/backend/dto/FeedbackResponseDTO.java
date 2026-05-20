package com.unimarket.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve apos criar, atualizar ou consultar um feedback
@Getter
@Setter
public class FeedbackResponseDTO {

    // identificador do feedback
    private Long id;

    // cliente que realizou o feedback
    private Long clientId;
    private String clientName;

    // produto avaliado
    private Long productId;
    private String productName;

    // nota e comentario da avaliacao
    private Integer vlNota;
    private String dsComentario;

    // data de criacao do feedback
    private LocalDateTime createdAt;
}
