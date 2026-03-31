package com.unimarket.backend.dto.password;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordRecoverDTO(
    @NotBlank(message = "O email é obrigatório") 
    @Email(message = "Email inválido") 
    String email
) {}