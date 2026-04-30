package com.unimarket.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class ClientProfileUpdateDTO {

    @Size(min = 2, max = 14, message = "O nome deve ter entre 2 e 14 caracteres")
    private String name;

    @Email(message = "Email invalido")
    private String email;

    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
