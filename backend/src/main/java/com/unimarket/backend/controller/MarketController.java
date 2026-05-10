package com.unimarket.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.MarketProfileUpdateDTO;
import com.unimarket.backend.dto.MarketResponseDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.service.MarketService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/markets")
@Tag(name = "Markets", description = "Gerenciamento e localizacao dos supermercados")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/me")
    @Operation(summary = "Consultar perfil do supermercado autenticado")
    public ResponseEntity<MarketResponseDTO> getCurrentProfile(Authentication authentication) {
        return ResponseEntity.ok(marketService.getCurrentProfile(getMarket(authentication)));
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualizar perfil do supermercado autenticado")
    public ResponseEntity<MarketResponseDTO> updateCurrentProfile(
            Authentication authentication,
            @Valid @RequestBody MarketProfileUpdateDTO dto
    ) {
        return ResponseEntity.ok(marketService.updateCurrentProfile(getMarket(authentication), dto));
    }

    @PostMapping("/me/sync-cnpj")
    @Operation(summary = "Sincronizar dados cadastrais do supermercado pelo CNPJ")
    public ResponseEntity<MarketResponseDTO> refreshCurrentProfileFromCnpj(Authentication authentication) {
        return ResponseEntity.ok(marketService.refreshCurrentProfileFromCnpj(getMarket(authentication)));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Listar supermercados filtrados por localizacao")
    public ResponseEntity<List<MarketResponseDTO>> listNearbyMarkets(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "10") Double radiusKm
    ) {
        return ResponseEntity.ok(marketService.listNearby(latitude, longitude, city, state, radiusKm));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar um mercado e todos os seus vinculos com produtos")
    public ResponseEntity<Void> deleteMarket(@PathVariable Long id) {
        marketService.deleteMarket(id);
        return ResponseEntity.noContent().build();
    }

    private Market getMarket(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Market market)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Supermercado autenticado obrigatorio");
        }

        return market;
    }
}
