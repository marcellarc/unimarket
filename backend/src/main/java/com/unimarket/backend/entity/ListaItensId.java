package com.unimarket.backend.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

/*
 Representa a chave primária composta da tabela lista_itens.
 É formada pelos campos cdLista e cdProduto, que identificam
 de forma única um produto dentro de uma lista de compras.
*/

@Embeddable
public class ListaItensId implements Serializable {

    private Long cdLista;
    private Long cdProduto;

    // getters, setters, equals e hashCode
}