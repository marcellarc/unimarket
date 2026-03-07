package com.unimarket.backend.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

/*
 Esta classe representa a CHAVE PRIMÁRIA COMPOSTA da tabela supermercado_produto.

 No banco de dados, a tabela supermercado_produto possui duas colunas
 que juntas formam a chave primária:
 
 - cd_supermercado
 - cd_produto

 No JPA usamos @Embeddable para indicar que essa classe pode ser
 incorporada em uma entidade como chave composta.

 A classe também precisa implementar Serializable, pois o JPA exige
 que chaves compostas possam ser serializadas.
*/

@Embeddable
public class SupermercadoProdutoId implements Serializable {

    private Long cdSupermercado;

    private Long cdProduto;

    // getters, setters, equals e hashCode
}
