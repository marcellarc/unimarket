package com.unimarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;


public class ClientDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nmCliente;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String dsEmail;

    @NotBlank(message = "A senha é obrigatória")
    private String dsSenha;

    //GETTERS E SETTERS

    public String getNmCliente() {
        return nmCliente;
    }

    public void setNmCliente(String nmCliente) {
        this.nmCliente = nmCliente;
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
}