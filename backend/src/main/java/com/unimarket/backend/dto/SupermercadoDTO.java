package com.unimarket.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


/**
 * DTO (Data Transfer Object) responsável por transportar os dados
 * de cadastro de supermercado entre o front-end (React) e o back-end.
 *
 * 🔹 Função principal:
 * - Receber os dados enviados pelo cliente (JSON da requisição HTTP)
 * - Garantir que esses dados estejam válidos antes de chegar na camada de serviço
 */

public class SupermercadoDTO {

    @NotBlank(message = "O nome do supermercado é obrigatório")
    private String nmMercado;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String dsCnpj;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String dsEmail;

    @NotBlank(message = "A senha é obrigatória")
    private String dsSenha;

    private String dsLogradouro;
    private String dsBairro;

    // GETTERS E SETTERS

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
}