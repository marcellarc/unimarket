package com.unimarket.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.FeedbackRequestDTO;
import com.unimarket.backend.dto.FeedbackReplyRequestDTO;
import com.unimarket.backend.dto.FeedbackResponseDTO;
import com.unimarket.backend.service.FeedbackService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// Controller responsavel pelos endpoints de feedbacks
@Tag(name = "Feedbacks", description = "API para gerenciamento de feedbacks de produtos")
@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Endpoint para cadastrar um feedback
    @Operation(summary = "Cadastrar feedback")
    @PostMapping
    public ResponseEntity<FeedbackResponseDTO> createFeedback(
            @Valid @RequestBody FeedbackRequestDTO dto
    ) {
        FeedbackResponseDTO response = feedbackService.createFeedback(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Endpoint para listar todos os feedbacks
    @Operation(summary = "Listar feedbacks")
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> listFeedbacks() {
        return ResponseEntity.ok(feedbackService.listFeedbacks());
    }

    // Endpoint para buscar um feedback pelo ID
    @Operation(summary = "Buscar feedback por ID")
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> findFeedbackById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(feedbackService.findFeedbackById(id));
    }

    // Endpoint para atualizar um feedback
    @Operation(summary = "Atualizar feedback")
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackRequestDTO dto
    ) {
        FeedbackResponseDTO response = feedbackService.updateFeedback(id, dto);
        return ResponseEntity.ok(response);
    }

    // Endpoint para resposta do mercado a um feedback
    @Operation(summary = "Responder feedback")
    @PutMapping("/{id}/reply")
    public ResponseEntity<FeedbackResponseDTO> replyFeedback(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackReplyRequestDTO dto
    ) {
        FeedbackResponseDTO response = feedbackService.replyFeedback(id, dto);
        return ResponseEntity.ok(response);
    }

    // Endpoint para deletar um feedback
    @Operation(summary = "Deletar feedback")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable Long id,
            @RequestParam Long clientId
    ) {
        feedbackService.deleteFeedback(id, clientId);
        return ResponseEntity.noContent().build();
    }
}
