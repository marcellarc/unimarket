package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.location.CepLocationResponseDTO;
import com.unimarket.backend.service.LocationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/location")
@Tag(name = "Location", description = "Consulta e normalizacao de localidade")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/cep/{cep}")
    @Operation(summary = "Consultar endereço e coordenadas por CEP")
    public ResponseEntity<CepLocationResponseDTO> findByCep(@PathVariable String cep) {
        return ResponseEntity.ok(locationService.findByCep(cep));
    }
}
