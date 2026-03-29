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

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdProduto;

    private String nmProduto;

    private String nmMarca;

    private String dsProduto;
    
    private String dsImgProduto;

    @ManyToOne
    @JoinColumn(name = "cd_categoria")
    private Categoria categoria;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dtCadastro;
    
    @PrePersist
    public void prePersist() {
        this.dtCadastro = LocalDateTime.now();
    }


    public Long getCdProduto() {
        return cdProduto;
    }

    public String getNmProduto() {
        return nmProduto;
    }

    public void setNmProduto(String nmProduto) {
        this.nmProduto = nmProduto;
    }

     public String getDsProduto() {
        return dsProduto;
    }

    public void setDsProduto(String dsProduto) {
        this.dsProduto = dsProduto;
    }

    public String getNmMarca() {
        return nmMarca;
    }

    public void setNmMarca(String nmMarca) {
        this.nmMarca = nmMarca;
    }

    public String getDsImgproduto() {
        return dsImgProduto;
    }

    public void setDsImgproduto(String dsImgproduto) {
        this.dsImgProduto = dsImgproduto;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public LocalDateTime getDtCadastro() {
        return dtCadastro;
    }
}
