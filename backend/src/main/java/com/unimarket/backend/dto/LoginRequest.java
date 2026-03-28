package com.unimarket.backend.dto;

public class LoginRequest {

// Objeto que recebe o email e senha da requisição

    private String email;
    private String senha;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}