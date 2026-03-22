package com.unimarket.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdProduto;

    private String nmProduto;

    private String nmMarca;

    private Double vlPreco;

    private String dsImgproduto;

    @ManyToOne
    @JoinColumn(name = "cd_categoria")
    private Categoria categoria;

    // getters e setters
}
