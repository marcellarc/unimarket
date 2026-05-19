package com.unimarket.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarketDTO {

    @NotBlank(message = "O nome do supermercado é obrigatório")
    private String name;

    @NotBlank(message = "O CNPJ é obrigatório")
    private String cnpj;

    @Email(message = "Email inválido")
    @NotBlank(message = "O email é obrigatório")
    private String email;

    // senha com mínimo 8 caracteres, letras maiúsculas, minúsculas, número e caractere especial
    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d])[A-Za-z\\d\\W]+$",
            message = "A senha deve conter letras maiúsculas, minúsculas, número e caractere especial"
    )
    private String password;

    private String streetAddress;
    private String neighborhood;
    private String city;
    private String state;
    private String zipCode;
    private Double latitude;
    private Double longitude;
}
