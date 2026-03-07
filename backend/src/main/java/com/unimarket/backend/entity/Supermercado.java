package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    private LocalDateTime dtCadastro;

    private Double vlLatitude;
    private Double vlLongitude;

    // getters e setters
}