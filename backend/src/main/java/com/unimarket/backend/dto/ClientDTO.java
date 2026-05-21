package com.unimarket.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 14, message = "O nome deve ter entre 2 e 14 caracteres")
    private String name;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    // senha com mínimo 8 caracteres, letras maiúsculas, minúsculas, número e caractere especial
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, max = 100, message = "A senha deve ter entre 8 e 100 caracteres")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d])[A-Za-z\\d\\W]+$",
            message = "A senha deve conter letras maiúsculas, minúsculas, número e caractere especial"
    )
    private String password;
}
