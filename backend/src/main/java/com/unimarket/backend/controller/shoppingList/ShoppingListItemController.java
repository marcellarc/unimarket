package com.unimarket.backend.controller.shoppingList;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.shoppingList.ShoppingListItemRequestDTO;
import com.unimarket.backend.dto.shoppingList.ShoppingListItemResponseDTO;
import com.unimarket.backend.service.shoppingList.ShoppingListItemService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// controller responsável pelos endpoints dos itens da lista de compras
@RestController
@RequestMapping("/api/shopping-lists/{shoppingListId}/items")
@Tag(name = "Shopping List Items", description = "Gerenciamento de itens da lista de compras")
public class ShoppingListItemController {

    @Autowired
    private ShoppingListItemService shoppingListItemService;

    // endpoint para adicionar um item à lista de compras
    @PostMapping
    @Operation(summary = "Adicionar item à lista de compras")
    public ResponseEntity<ShoppingListItemResponseDTO> addItem(
            @PathVariable Long shoppingListId,
            @Valid @RequestBody ShoppingListItemRequestDTO dto
    ) {
        ShoppingListItemResponseDTO response = shoppingListItemService.addItem(dto, shoppingListId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // retorna 201
    }

    // endpoint para listar todos os itens de uma lista de compras
    @GetMapping
    @Operation(summary = "Listar itens da lista de compras")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> listItems(
            @PathVariable Long shoppingListId
    ) {
        return ResponseEntity.ok(shoppingListItemService.listItemsByShoppingList(shoppingListId)); // retorna 200
    }

    // endpoint para remover um item da lista de compras
    @DeleteMapping("/{itemId}")
    @Operation(summary = "Remover item da lista de compras")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long shoppingListId,
            @PathVariable Long itemId
    ) {
        shoppingListItemService.removeItem(shoppingListId, itemId);
        return ResponseEntity.noContent().build(); // retorna 204
    }
}