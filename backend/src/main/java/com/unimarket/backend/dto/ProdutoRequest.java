package com.unimarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

// DTO com os dados que o mercado envia para cadastrar um produto
@Getter
@Setter
public class ProdutoRequest {

    // nome do produto
    private String nmProduto;

    // marca do produto
    private String nmMarca;

    // descrição detalhada do produto
    private String dsProduto;

    // URL ou caminho da imagem do produto
    private String dsImgProduto;

    // ID da categoria à qual o produto pertence
    private Long cdCategoria;

    // código de barras — usado para evitar duplicatas no cadastro
    // código de barras — deve ter exatamente 13 dígitos numéricos
    @NotBlank(message = "Código de barras é obrigatório")
    @Pattern(regexp = "\\d{13}", message = "Código de barras deve conter exatamente 13 dígitos numéricos")
    private String dsCodBarra;
}