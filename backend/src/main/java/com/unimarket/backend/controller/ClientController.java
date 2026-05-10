package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.ClientProfileResponseDTO;
import com.unimarket.backend.dto.ClientProfileUpdateDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.service.ClientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Gerenciamento de clientes")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @GetMapping("/me")
    @Operation(summary = "Consultar perfil do cliente autenticado")
    public ResponseEntity<ClientProfileResponseDTO> getCurrentProfile(Authentication authentication) {
        return ResponseEntity.ok(clientService.getCurrentProfile(getClient(authentication)));
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualizar perfil do cliente autenticado")
    public ResponseEntity<ClientProfileResponseDTO> updateCurrentProfile(
            Authentication authentication,
            @Valid @RequestBody ClientProfileUpdateDTO dto
    ) {
        return ResponseEntity.ok(clientService.updateCurrentProfile(getClient(authentication), dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar um cliente")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    private Client getClient(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Client client)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente autenticado obrigatorio");
        }

        return client;
    }
}
