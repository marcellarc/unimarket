package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// Entidade que representa uma categoria de produtos
@Getter
@Setter

// Implementação de soft delete: ao invés de remover o registro, marca como deletado
@SQLDelete(sql = "UPDATE categories SET deleted_at = NOW() WHERE id = ?")
// Garante que apenas categorias não deletadas sejam retornadas nas consultas
@SQLRestriction("deleted_at IS NULL")

@Entity
@Table(name = "categories")
@Schema(description = "Entidade representando uma categoria de produtos")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único da categoria", example = "1")
    private Long id;

    // nome da categoria — obrigatório e único no sistema
    @Column(nullable = false, unique = true)
    @Schema(description = "Nome da categoria", example = "Alimentos")
    private String name;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Timestamp de quando a categoria foi criada")
    private LocalDateTime createdAt;

    // atualizado automaticamente a cada alteração no registro
    @Column(name = "updated_at", nullable = false)
    @Schema(description = "Timestamp da última atualização da categoria")
    private LocalDateTime updatedAt;

    // nulo significa que a categoria está ativa — soft delete
    @Column(name = "deleted_at")
    @Schema(description = "Timestamp de quando a categoria foi deletada")
    private LocalDateTime deletedAt;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now(); // inicializa junto com createdAt
    }

    @PreUpdate
    public void preUpdate() {
        // atualiza a data a cada alteração no registro
        this.updatedAt = LocalDateTime.now();
    }
}