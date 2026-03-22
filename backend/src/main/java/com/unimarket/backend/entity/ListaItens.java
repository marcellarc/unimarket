package com.unimarket.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lista_itens")
public class ListaItens {

    @EmbeddedId
    private ListaItensId id;

    private Integer qtProduto;

    // getters e setters
}
