package com.unimarket.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "lista_compras")
public class ListaCompras {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdLista;

    @ManyToOne
    @JoinColumn(name = "cd_cliente")
    private Cliente cliente;

    private String nmLista;

    private LocalDateTime dtCriacao;

    // getters e setters
}
