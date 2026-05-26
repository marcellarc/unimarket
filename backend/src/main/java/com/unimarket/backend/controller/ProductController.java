package com.unimarket.backend.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.CosmosLookupResponseDTO;
import com.unimarket.backend.dto.MarketProductResponseDTO;
import com.unimarket.backend.service.CosmosService;
import com.unimarket.backend.service.MarketProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Products", description = "API para consulta do catalogo de produtos")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private CosmosService cosmosService;

    @Autowired
    private MarketProductService marketProductService;

    // endpoint para listar todos os vínculos mercado-produto paginados
    @Operation(summary = "Listar todos os produtos disponíveis nos mercados")
    @GetMapping({"", "/"})
    public ResponseEntity<Page<MarketProductResponseDTO>> listAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        Page<MarketProductResponseDTO> response
                = marketProductService.listAllProducts(page, size);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Buscar produto por código de barras")
    @GetMapping("/lookup")
    public ResponseEntity<CosmosLookupResponseDTO> lookupByBarCode(@RequestParam String barCode) {
        String normalizedBarCode = normalizeBarCode(barCode);

        if (normalizedBarCode == null || !normalizedBarCode.matches("\\d{8,14}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um código de barras válido com 8 a 14 dígitos.");
        }

        CosmosLookupResponseDTO response = cosmosService.lookupByBarCode(normalizedBarCode);

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado. Preencha os dados manualmente.");
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

    // endpoint para busca global de produtos
    @Operation(summary = "Buscar produtos por nome")
    @GetMapping("/search")
    public ResponseEntity<Page<MarketProductResponseDTO>> findProductsByName(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        Page<MarketProductResponseDTO> response
                = marketProductService.findProductsByName(
                        name,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }

    // endpoint para busca por nome e faixa de preço
    @Operation(summary = "Buscar produtos por nome e faixa de preço")
    @GetMapping("/search/price")
    public ResponseEntity<Page<MarketProductResponseDTO>>
            findProductsByNameAndPriceRange(
                    @RequestParam String name,
                    @RequestParam BigDecimal minPrice,
                    @RequestParam BigDecimal maxPrice,
                    @RequestParam(defaultValue = "0") int page,
                    @RequestParam(defaultValue = "20") int size
            ) {

        Page<MarketProductResponseDTO> response
                = marketProductService.findProductsByNameAndPriceRange(
                        name,
                        minPrice,
                        maxPrice,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }
}
