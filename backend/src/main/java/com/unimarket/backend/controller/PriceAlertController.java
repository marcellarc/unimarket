package com.unimarket.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.notification.PriceAlertRequestDTO;
import com.unimarket.backend.dto.notification.PriceAlertResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.service.PriceAlertService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/price-alerts")
@Tag(name = "Price Alerts", description = "Alertas de preço desejado para clientes")
public class PriceAlertController {

    @Autowired
    private PriceAlertService priceAlertService;

    @PostMapping
    @Operation(summary = "Criar ou atualizar alerta de preço")
    public ResponseEntity<PriceAlertResponseDTO> createAlert(
            Authentication authentication,
            @Valid @RequestBody PriceAlertRequestDTO dto
    ) {
        return ResponseEntity.ok(priceAlertService.createAlert(getClient(authentication), dto));
    }

    @GetMapping
    @Operation(summary = "Listar alertas do cliente autenticado")
    public ResponseEntity<List<PriceAlertResponseDTO>> listAlerts(Authentication authentication) {
        return ResponseEntity.ok(priceAlertService.listAlerts(getClient(authentication)));
    }

    @DeleteMapping("/{alertId}")
    @Operation(summary = "Desativar alerta de preço")
    public ResponseEntity<Void> deactivateAlert(Authentication authentication, @PathVariable Long alertId) {
        priceAlertService.deactivateAlert(getClient(authentication), alertId);
        return ResponseEntity.noContent().build();
    }

    private Client getClient(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Client client)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente autenticado obrigatório");
        }

        return client;
    }
}
