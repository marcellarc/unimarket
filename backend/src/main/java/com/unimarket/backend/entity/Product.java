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
    @Column(name = "id")
    private Long id;

    @Schema(description = "Nome do produto", example = "Arroz Branco")
    @Column(name = "name")
    private String name;

    @Schema(description = "Marca do produto", example = "Tio João")
    @Column(name = "brand")
    private String brand;

    @Schema(description = "Descrição detalhada do produto", example = "Arroz branco tipo 1, 5kg")
    @Column(name = "description")
    private String description;

    @Schema(description = "URL da imagem do produto", example = "https://example.com/image.jpg")
    @Column(name = "image_url")
    private String imageUrl;

    // coluna no banco chamada "bar_code", única por produto
    @Schema(description = "Código de barras do produto", example = "7891234567890")
    @Column(name = "bar_code", unique = true)
    private String barCode;

    // relacionamento com a categoria do produto
    @Schema(description = "Categoria à qual o produto pertence")
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // preenchido automaticamente na criação, nunca atualizado
    @Schema(description = "Data de criação do produto")
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
    }
}
