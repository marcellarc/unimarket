package com.unimarket.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDTO {

    @NotBlank(message = "Nome da categoria e obrigatorio")
    @Size(max = 100, message = "Nome da categoria deve ter no maximo 100 caracteres")
    private String name;
}
