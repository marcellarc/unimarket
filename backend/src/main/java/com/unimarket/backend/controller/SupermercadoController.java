package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.SupermercadoDTO;
import com.unimarket.backend.entity.Supermercado;
import com.unimarket.backend.service.SupermercadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/supermercados")
public class SupermercadoController {

    @Autowired
    private SupermercadoService service;

    @PostMapping
    public ResponseEntity<Supermercado> cadastrar(@RequestBody @Valid SupermercadoDTO dto) {
        return ResponseEntity.ok(service.cadastrar(dto));
    }
}