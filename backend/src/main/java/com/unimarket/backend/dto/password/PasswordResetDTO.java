package com.unimarket.backend.dto.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasswordResetDTO(
    @NotBlank String email,
    @NotBlank String code,

    @NotBlank(message = "A nova senha e obrigatoria")
    @Size(min = 8, max = 100, message = "A senha deve ter entre 8 e 100 caracteres")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d])[A-Za-z\\d\\W]+$",
        message = "A senha deve conter letras maiúsculas, minúsculas, número e caractere especial"
    )
    String newPassword
) {}
