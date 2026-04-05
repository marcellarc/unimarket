package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.Setter;

// Entidade que representa um supermercado cadastrado no sistema
@Getter
@Setter
@Entity
@Table(name = "supermercados")
public class Mercado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdMercado;

    private String nmMercado;
    private String dsCnpj;
    private String dsEmail;
    private String dsSenha;
    private String dsLogradouro;
    private String dsBairro;

    // preenchido automaticamente na criação, nunca atualizado
    @Column(nullable = false, updatable = false)
    private LocalDateTime dtCadastro;

    @PrePersist
    public void prePersist() {
        // define a data no momento do save
        this.dtCadastro = LocalDateTime.now();
    }
}