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
    @Column(name = "id")
    private Long id;

    // referência ao produto do catálogo global
    @Schema(description = "Produto vinculado")
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // referência ao mercado que vende o produto
    @Schema(description = "Mercado que vende o produto")
    @ManyToOne
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    // preço praticado por este mercado — informado pelo mercado após o vínculo
    @Schema(description = "Preço praticado pelo mercado", example = "15.99")
    @Column(name = "price", nullable = true)
    private Double price;

    // quantidade em estoque — informada pelo mercado após o vínculo
    @Schema(description = "Quantidade em estoque", example = "100")
    @Column(name = "stock_quantity", nullable = true)
    private Integer stockQuantity;

    // atualizado automaticamente na criação e em cada alteração
    @Schema(description = "Data da última atualização")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
