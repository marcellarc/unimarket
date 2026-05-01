package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.service.MarketService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/markets")
@Tag(name = "Markets", description = "Gerenciamento de perfil dos supermercados (Requer Login)")
public class MarketController {

    // injeta o service responsável pelas regras de negócio do mercado
    @Autowired
    private MarketService marketService;

    // deletar mercado
    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar um mercado e todos os seus vínculos com produtos")
    public ResponseEntity<Void> deleteMarket(@PathVariable Long id) {
        marketService.deleteMarket(id);
        return ResponseEntity.noContent().build(); // retorna 204
    }

    // No futuro, vamos colocar rotas aqui como:
    // GET /api/markets/me (Ver os dados do próprio mercado)
    // PUT /api/markets/me (Editar o endereço, etc)
    // p essas rotas, o mercado já vai ter que estar logado
}