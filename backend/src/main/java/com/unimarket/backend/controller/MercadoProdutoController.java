package com.unimarket.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.MercadoProdutoRequest;
import com.unimarket.backend.dto.MercadoProdutoResponse;
import com.unimarket.backend.dto.ProdutoRequest;
import com.unimarket.backend.dto.ProdutoResponse;
import com.unimarket.backend.service.MercadoProdutoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

// Define um grupo no Swagger
@Tag(name = "Mercado Produtos", description = "API para gerenciamento de produtos por mercado")
@RestController
@RequestMapping("/mercados/{cdMercado}/produtos") // todas as rotas vinculadas a um mercado
public class MercadoProdutoController {

    @Autowired
    private MercadoProdutoService mercadoProdutoService;

    // Endpoint para cadastrar um produto vinculado ao mercado
    @Operation(summary = "Cadastrar produto para um mercado")
    @PostMapping
    public ResponseEntity<ProdutoResponse> cadastrarProduto(
            @PathVariable Long cdMercado,      // ID do mercado que está cadastrando
            @Valid @RequestBody ProdutoRequest dto // @Valid ativa as validações do DTO
    ) {
        ProdutoResponse response = mercadoProdutoService.cadastrarProduto(dto, cdMercado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // retorna 201
    }

    // Endpoint para listar todos os produtos de um mercado
    @Operation(summary = "Listar produtos de um mercado")
    @GetMapping
    public ResponseEntity<List<ProdutoResponse>> listarProdutos(
            @PathVariable Long cdMercado // ID do mercado
    ) {
        return ResponseEntity.ok(mercadoProdutoService.listarProdutosPorMercado(cdMercado)); // retorna 200
    }

    // Endpoint para buscar produtos de um mercado pelo nome
    @Operation(summary = "Buscar produtos por nome")
    @GetMapping("/buscar")
    public ResponseEntity<List<ProdutoResponse>> buscarPorNome(
            @PathVariable Long cdMercado, // ID do mercado
            @RequestParam String nome     // nome ou parte do nome do produto
    ) {
        return ResponseEntity.ok(mercadoProdutoService.buscarPorNome(cdMercado, nome)); // retorna 200
    }

    // Endpoint para buscar um produto específico de um mercado pelo ID
    @Operation(summary = "Buscar produto por ID")
    @GetMapping("/{cdProduto}")
    public ResponseEntity<ProdutoResponse> buscarPorId(
            @PathVariable Long cdMercado, // ID do mercado
            @PathVariable Long cdProduto  // ID do produto
    ) {
        return ResponseEntity.ok(mercadoProdutoService.buscarPorId(cdMercado, cdProduto)); // retorna 200
    }

    // Endpoint para atualizar preço e estoque de um produto vinculado ao mercado
    @Operation(summary = "Atualizar preço e estoque de um produto")
    @PutMapping("/{cdProduto}")
    public ResponseEntity<MercadoProdutoResponse> atualizarPrecoEstoque(
            @PathVariable Long cdMercado,              // ID do mercado
            @PathVariable Long cdProduto,              // ID do produto
            @Valid @RequestBody MercadoProdutoRequest dto // dados de preço e estoque
    ) {
        MercadoProdutoResponse response = mercadoProdutoService.atualizarPrecoEstoque(cdMercado, cdProduto, dto);
        return ResponseEntity.ok(response); // retorna 200
    }
}