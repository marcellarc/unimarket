package com.unimarket.backend.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "categories")
@Schema(description = "Entidade representando uma categoria de produtos")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único da categoria", example = "1")
    private Long id;

    @Schema(description = "Nome da categoria", example = "Alimentos")
    private String name;

    // getters e setters
}
