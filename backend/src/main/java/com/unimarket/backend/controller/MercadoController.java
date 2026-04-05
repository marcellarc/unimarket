package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.MercadoDTO;
import com.unimarket.backend.entity.Mercado;
import com.unimarket.backend.service.MercadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/supermercados")
public class MercadoController {

    @Autowired
    private MercadoService service;

    @PostMapping
    public ResponseEntity<Mercado> cadastrar(@RequestBody @Valid MercadoDTO dto) {
        return ResponseEntity.ok(service.cadastrar(dto));
    }
}