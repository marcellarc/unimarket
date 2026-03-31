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
public class MarketDTO {

    @NotBlank(message = "O nome do supermercado é obrigatório")
    private String name;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String cnpj;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String password;

    private String streetAddress;
    
    private String neighborhood;

    // GETTERS E SETTERS

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(String neighborhood) {
        this.neighborhood = neighborhood;
    }
}