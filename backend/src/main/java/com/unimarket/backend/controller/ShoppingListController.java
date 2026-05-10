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
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.ShoppingListRequestDTO;
import com.unimarket.backend.dto.ShoppingListResponseDTO;
import com.unimarket.backend.service.ShoppingListService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

// controller responsável pelos endpoints de lista de compras
@RestController
@RequestMapping("/api/clients/{clientId}/shopping-lists")
@Tag(name = "Shopping Lists", description = "Gerenciamento de listas de compras dos clientes")
public class ShoppingListController {

    @Autowired
    private ShoppingListService shoppingListService;

    // endpoint para criar uma nova lista de compras
    @PostMapping
    @Operation(summary = "Criar lista de compras")
    public ResponseEntity<ShoppingListResponseDTO> createShoppingList(
            @PathVariable Long clientId,
            @RequestBody ShoppingListRequestDTO dto
    ) {
        ShoppingListResponseDTO response = shoppingListService.createShoppingList(dto, clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // retorna 201
    }

    // endpoint para listar todas as listas de compras de um cliente
    @GetMapping
    @Operation(summary = "Listar listas de compras do cliente")
    public ResponseEntity<List<ShoppingListResponseDTO>> listShoppingLists(
            @PathVariable Long clientId
    ) {
        return ResponseEntity.ok(shoppingListService.listShoppingListsByClient(clientId)); // retorna 200
    }

    // endpoint para editar o nome de uma lista de compras
    @PutMapping("/{id}")
    @Operation(summary = "Editar nome da lista de compras")
    public ResponseEntity<ShoppingListResponseDTO> updateShoppingListName(
            @PathVariable Long clientId,
            @PathVariable Long id,
            @RequestBody ShoppingListRequestDTO dto
    ) {
        ShoppingListResponseDTO response = shoppingListService.updateShoppingListName(clientId, id, dto);
        return ResponseEntity.ok(response); // retorna 200
    }

    // endpoint para deletar uma lista de compras
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar lista de compras")
    public ResponseEntity<Void> deleteShoppingList(
            @PathVariable Long clientId,
            @PathVariable Long id
    ) {
        shoppingListService.deleteShoppingList(clientId, id);
        return ResponseEntity.noContent().build(); // retorna 204
    }
}
