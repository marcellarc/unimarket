package com.unimarket.backend.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o sistema devolve após atualizar preço e estoque de um produto
@Getter
@Setter
public class MercadoProdutoResponse {

    // ID do vínculo entre mercado e produto
    private Long cdMercProd;

    // nome do mercado
    private String nmMercado;

    // nome do produto
    private String nmProduto;

    // marca do produto
    private String nmMarca;

    // preço praticado pelo mercado
    private Double vlPreco;

    // quantidade em estoque
    private Integer qtEstoque;

    // data da última atualização de preço ou estoque
    private LocalDateTime dtAtualizacao;
}