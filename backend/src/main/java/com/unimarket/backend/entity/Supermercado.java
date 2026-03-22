package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "supermercados")
public class Supermercado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdMercado;

    private String nmMercado;
    private String dsCnpj;
    private String dsEmail;
    private String dsSenha;
    private String dsLogradouro;
    private String dsBairro;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dtCadastro;
    
    @PrePersist
    public void prePersist() {
        this.dtCadastro = LocalDateTime.now();
    }

    public Long getCdMercado() {
        return cdMercado;
    }   

    public void setCdMercado(Long cdMercado) {
        this.cdMercado = cdMercado;
    }

    public String getNmMercado() {
        return nmMercado;
    }

    public void setNmMercado(String nmMercado) {
        this.nmMercado = nmMercado;
    }

    public String getDsCnpj() {
        return dsCnpj;
    }

    public void setDsCnpj(String dsCnpj) {
        this.dsCnpj = dsCnpj;
    }

    public String getDsEmail() {
        return dsEmail;
    }

    public void setDsEmail(String dsEmail) {
        this.dsEmail = dsEmail;
    }

    public String getDsSenha() {
        return dsSenha;
    }

    public void setDsSenha(String dsSenha) {
        this.dsSenha = dsSenha;
    }

    public String getDsLogradouro() {
        return dsLogradouro;
    }

    public void setDsLogradouro(String dsLogradouro) {
        this.dsLogradouro = dsLogradouro;
    }

    public String getDsBairro() {
        return dsBairro;
    }

    public void setDsBairro(String dsBairro) {
        this.dsBairro = dsBairro;
    }

    public LocalDateTime getDtCadastro() {
        return dtCadastro;
    }
}