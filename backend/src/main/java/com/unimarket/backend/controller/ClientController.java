package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.entity.Cliente;
import com.unimarket.backend.service.ClientService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Cadastro e gerenciamento de clientes")
public class ClientController {

    @Autowired
    private ClientService service;

    @PostMapping("/register")
    public Cliente register(@Valid @RequestBody ClientDTO dto) {
        return service.register(dto);
    }
}