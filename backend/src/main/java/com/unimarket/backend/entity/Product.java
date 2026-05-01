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

// Entidade que representa um produto do catálogo global
@Getter
@Setter
@Entity
@Table(
    name = "products",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "bar_code") // impede produto duplicado pelo código de barras
    }
)
@Schema(description = "Entidade representando um produto do catálogo global")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do produto", example = "1")
    private Long id;

    // nome do produto
    @Column(name = "name")
    @Schema(description = "Nome do produto", example = "Arroz Branco")
    private String name;

    // marca do produto
    @Column(name = "brand")
    @Schema(description = "Marca do produto", example = "Tio João")
    private String brand;

    // descrição detalhada do produto
    @Column(name = "description")
    @Schema(description = "Descrição detalhada do produto", example = "Arroz branco tipo 1, 5kg")
    private String description;

    // URL da imagem do produto
    @Column(name = "image_url")
    @Schema(description = "URL da imagem do produto", example = "https://example.com/image.jpg")
    private String imageUrl;

    // código de barras único — usado para evitar duplicatas no cadastro
    @Column(name = "bar_code", unique = true)
    @Schema(description = "Código de barras do produto", example = "7891234567890")
    private String barCode;

    // relacionamento com a categoria do produto
    @ManyToOne
    @JoinColumn(name = "category_id")
    @Schema(description = "Categoria à qual o produto pertence")
    private Category category;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando o produto foi criado")
    private LocalDateTime createdAt;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da última atualização do produto")
    private LocalDateTime updatedAt;

    // nulo significa que o produto está ativo — soft delete
    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando o produto foi deletado")
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