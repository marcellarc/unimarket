package com.unimarket.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

// DTO com os dados que o sistema devolve após o cadastro ou consulta de um produto
@Getter
@Setter
public class ProdutoResponse {

    // identificador gerado pelo banco
    private Long cdProduto;

    // nome do produto
    private String nmProduto;

    // marca do produto
    private String nmMarca;

    // descrição detalhada do produto
    private String dsProduto;

    // URL ou caminho da imagem do produto
    private String dsImgProduto;

    // nome da categoria para exibição (evita expor só o ID)
    private String nmCategoria;

    // código de barras do produto
    private String dsCodBarra;

    // data em que o produto foi cadastrado no sistema
    private LocalDate dtCadastro;
}