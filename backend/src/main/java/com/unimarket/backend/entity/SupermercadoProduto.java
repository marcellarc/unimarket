package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "supermercado_produto")
public class SupermercadoProduto {

    @EmbeddedId
    private SupermercadoProdutoId id;

    private Double vlPreco;

    private Integer qtEstoque;

    private String dsImagemUrl;

    private LocalDateTime dtAtualizacao;

    // getters e setters
}