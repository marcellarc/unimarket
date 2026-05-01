package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
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
    name = "market_products",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"product_id", "market_id"}) // impede vínculo duplicado
    }
)
@Schema(description = "Entidade representando o vínculo entre um mercado e um produto")
public class MarketProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do vínculo", example = "1")
    private Long id;

    // referência ao produto do catálogo global
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @Schema(description = "Produto vinculado")
    private Product product;

    // referência ao mercado que vende o produto
    @ManyToOne
    @JoinColumn(name = "market_id", nullable = false)
    @Schema(description = "Mercado que vende o produto")
    private Market market;

    // preço praticado por este mercado — informado pelo mercado após o vínculo
    @Column(name = "price")
    @Schema(description = "Preço praticado pelo mercado", example = "15.99")
    private Double price;

    // quantidade em estoque — informada pelo mercado após o vínculo
    @Column(name = "stock_quantity")
    @Schema(description = "Quantidade em estoque", example = "100")
    private Integer stockQuantity;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o vínculo foi criado")
    private LocalDateTime createdAt;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da última atualização do vínculo")
    private LocalDateTime updatedAt;

    // nulo significa que o vínculo está ativo — soft delete
    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o vínculo foi deletado")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        // atualiza a data a cada alteração no registro
        this.updatedAt = LocalDateTime.now();
    }
}