package com.unimarket.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/markets")
@Tag(name = "Markets", description = "Gerenciamento de perfil dos supermercados (Requer Login)")
public class MarketController {

    // No futuro, vamos colocar rotas aqui como:
    // GET /api/markets/me (Ver os dados do próprio mercado)
    // PUT /api/markets/me (Editar o endereço, etc)
    // p essas rotas, o mercado já vai ter que estar logado

}