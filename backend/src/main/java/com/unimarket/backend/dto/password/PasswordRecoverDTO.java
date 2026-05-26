package com.unimarket.backend.dto.password;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PasswordRecoverDTO(
    @NotBlank(message = "O e-mail é obrigatório") 
    @Email(message = "E-mail inválido") 
    String email
) {}
