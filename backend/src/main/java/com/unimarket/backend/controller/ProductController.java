package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.CosmosLookupResponseDTO;
import com.unimarket.backend.service.CosmosService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Products", description = "API para consulta do catalogo de produtos")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private CosmosService cosmosService;

    @Operation(summary = "Buscar produto por codigo de barras")
    @GetMapping("/lookup")
    public ResponseEntity<CosmosLookupResponseDTO> lookupByBarCode(@RequestParam String barCode) {
        String normalizedBarCode = normalizeBarCode(barCode);

        if (normalizedBarCode == null || !normalizedBarCode.matches("\\d{8,14}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um codigo de barras valido com 8 a 14 digitos.");
        }

        CosmosLookupResponseDTO response = cosmosService.lookupByBarCode(normalizedBarCode);

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto nao encontrado. Preencha os dados manualmente.");
        }

        return ResponseEntity.ok(response);
    }

    private String normalizeBarCode(String barCode) {
        if (barCode == null) {
            return null;
        }

        String normalized = barCode.replaceAll("\\D", "");
        return normalized.isBlank() ? null : normalized;
    }
}
