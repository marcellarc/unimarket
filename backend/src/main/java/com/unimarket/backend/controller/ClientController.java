package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.service.ClientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Gerenciamento de clientes")
public class ClientController {

    // injeta o service responsável pelas regras de negócio do cliente
    @Autowired
    private ClientService clientService;

    // deletar cliente
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar um cliente")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build(); // retorna 204
    }
}