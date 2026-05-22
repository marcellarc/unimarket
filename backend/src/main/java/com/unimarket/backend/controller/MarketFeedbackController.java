package com.unimarket.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.FeedbackResponseDTO;
import com.unimarket.backend.service.FeedbackService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// Controller responsavel pelos feedbacks vinculados a um mercado
@Tag(name = "Market Feedbacks", description = "API para consulta de feedbacks por mercado")
@RestController
@RequestMapping("/api/markets/{marketId}/feedbacks")
public class MarketFeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // Endpoint para listar feedbacks de um mercado
    @Operation(summary = "Listar feedbacks de um mercado")
    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> listFeedbacksByMarket(
            @PathVariable Long marketId
    ) {
        return ResponseEntity.ok(feedbackService.listFeedbacksByMarket(marketId));
    }
}
