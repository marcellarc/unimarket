package com.unimarket.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/clients")
@Tag(name = "Clients", description = "Cadastro e gerenciamento de clientes")
public class ClientController {
}