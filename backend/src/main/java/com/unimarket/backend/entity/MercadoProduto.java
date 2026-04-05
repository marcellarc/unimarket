package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.Setter;

// Entidade que representa o vínculo entre um mercado e um produto
@Getter
@Setter
@Entity
@Table(
    name = "mercado_produto",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cd_produto", "cd_supermercado"}) // impede vínculo duplicado
    }
)
public class MercadoProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdMercProd;

    // referência ao produto do catálogo global
    @ManyToOne
    @JoinColumn(name = "cd_produto", nullable = false)
    private Produto produto;

    // referência ao mercado que vende o produto
    @ManyToOne
    @JoinColumn(name = "cd_supermercado", nullable = false)
    private Mercado supermercado;

    // preço praticado por este mercado — informado pelo mercado após o vínculo
    @Column(nullable = true)
    private Double vlPreco;

    // quantidade em estoque — informada pelo mercado após o vínculo
    @Column(nullable = true)
    private Integer qtEstoque;

    // atualizado automaticamente na criação e em cada alteração
    private LocalDateTime dtAtualizacao;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.dtAtualizacao = LocalDateTime.now();
    }
}