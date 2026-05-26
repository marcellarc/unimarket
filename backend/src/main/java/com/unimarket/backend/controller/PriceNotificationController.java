package com.unimarket.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.notification.PriceNotificationResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.service.PriceAlertService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notificações de alertas de preço")
public class PriceNotificationController {

    @Autowired
    private PriceAlertService priceAlertService;

    @GetMapping
    @Operation(summary = "Listar notificações do cliente autenticado")
    public ResponseEntity<List<PriceNotificationResponseDTO>> listNotifications(Authentication authentication) {
        return ResponseEntity.ok(priceAlertService.listNotifications(getClient(authentication)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Contar notificações não lidas")
    public ResponseEntity<Map<String, Long>> countUnreadNotifications(Authentication authentication) {
        long unreadCount = priceAlertService.countUnreadNotifications(getClient(authentication));
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }

    @PatchMapping("/read")
    @Operation(summary = "Marcar todas as notificações como lidas")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        priceAlertService.markAllNotificationsAsRead(getClient(authentication));
        return ResponseEntity.noContent().build();
    }

    private Client getClient(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Client client)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente autenticado obrigatório");
        }

        return client;
    }
}
