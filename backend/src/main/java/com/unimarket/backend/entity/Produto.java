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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.Setter;

// Entidade que representa um produto do catálogo global
@Getter
@Setter
@Entity
@Table(
    name = "produtos",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "codigo_barras") // impede produto duplicado pelo código de barras
    }
)
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdProduto;

    private String nmProduto;
    private String nmMarca;
    private String dsProduto;
    private String dsImgProduto;

    // coluna no banco chamada "codigo_barras", única por produto
    @Column(name = "codigo_barras", unique = true)
    private String dsCodBarra;

    // relacionamento com a categoria do produto
    @ManyToOne
    @JoinColumn(name = "cd_categoria")
    private Categoria categoria;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(nullable = false, updatable = false)
    private LocalDateTime dtCadastro;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.dtCadastro = LocalDateTime.now();
    }
}