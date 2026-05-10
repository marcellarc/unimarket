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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.MarketProductRequestDTO;
import com.unimarket.backend.dto.MarketProductResponseDTO;
import com.unimarket.backend.dto.ProductRequestDTO;
import com.unimarket.backend.dto.ProductResponseDTO;
import com.unimarket.backend.service.MarketProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// Define um grupo no Swagger
@Tag(name = "Market Products", description = "API para gerenciamento de produtos por mercado")
@RestController
@RequestMapping("/api/markets/{marketId}/products") // todas as rotas vinculadas a um mercado
public class MarketProductController {

    @Autowired
    private MarketProductService marketProductService;

    // Endpoint para cadastrar um produto vinculado ao mercado
    @Operation(summary = "Cadastrar produto para um mercado")
    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(
            @PathVariable Long marketId, // ID do mercado que está cadastrando
            @Valid @RequestBody ProductRequestDTO dto // @Valid ativa as validações do DTO
    ) {
        ProductResponseDTO response = marketProductService.createProduct(dto, marketId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // retorna 201
    }

    // Endpoint para listar todos os produtos de um mercado
    @Operation(summary = "Listar produtos de um mercado")
    @GetMapping
    public ResponseEntity<List<MarketProductResponseDTO>> listProducts(
            @PathVariable Long marketId // ID do mercado
    ) {
        return ResponseEntity.ok(marketProductService.listProductByMarket(marketId)); // retorna 200
    }

    // Endpoint para buscar produtos de um mercado pelo nome
    @Operation(summary = "Buscar produtos por nome")
    @GetMapping("/search")
    public ResponseEntity<List<MarketProductResponseDTO>> searchProducts(
            @PathVariable Long marketId, // ID do mercado
            @RequestParam String name // nome ou parte do nome do produto
    ) {
        return ResponseEntity.ok(marketProductService.findProducts(marketId, name)); // retorna 200
    }

    // Endpoint para buscar um produto específico de um mercado pelo ID
    @Operation(summary = "Buscar produto por ID")
    @GetMapping("/{productId}")
    public ResponseEntity<MarketProductResponseDTO> searchProductById(
            @PathVariable Long marketId, // ID do mercado
            @PathVariable Long productId // ID do produto
    ) {
        return ResponseEntity.ok(marketProductService.findProductById(marketId, productId)); // retorna 200
    }

    // Endpoint para atualizar preço e estoque de um produto vinculado ao mercado
    @Operation(summary = "Atualizar preço e estoque de um produto")
    @PutMapping("/{productId}")
    public ResponseEntity<MarketProductResponseDTO> updateProductPriceAndStock(
            @PathVariable Long marketId, // ID do mercado
            @PathVariable Long productId, // ID do produto
            @Valid @RequestBody MarketProductRequestDTO dto // dados de preço e estoque
    ) {
        MarketProductResponseDTO response = marketProductService.updateProductPriceAndStock(marketId, productId, dto);
        return ResponseEntity.ok(response); // retorna 200
    }


    // endpoint para deletar o vínculo entre mercado e produto
    @Operation(summary = "Deletar vínculo entre mercado e produto")
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteMarketProduct(
            @PathVariable Long marketId,  // ID do mercado
            @PathVariable Long productId  // ID do produto
    ) {
        marketProductService.deleteMarketProduct(marketId, productId);
        return ResponseEntity.noContent().build(); // retorna 204
    }
}
