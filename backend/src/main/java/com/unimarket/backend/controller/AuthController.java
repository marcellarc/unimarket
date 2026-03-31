package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.MarketDTO;
import com.unimarket.backend.dto.login.LoginRequestDTO;
import com.unimarket.backend.dto.login.LoginResponseDTO;
import com.unimarket.backend.dto.token.RefreshTokenRequestDTO;
import com.unimarket.backend.dto.token.TokenResponseDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.service.AuthService;
import com.unimarket.backend.service.MarketService;
import com.unimarket.backend.service.TokenService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth") 
@Tag(name = "Authentication", description = "Rotas de autenticação e cadastro")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private MarketService marketService;


    @Autowired
    private TokenService tokenService;

    //cadastro mercado
    @PostMapping("/register/market")
    @Operation(summary = "Cadastrar um novo supermercado")
    public ResponseEntity<Market> registerMarket(@RequestBody @Valid MarketDTO dto) {
        return ResponseEntity.ok(marketService.register(dto));
    }

    //login mercado
    @PostMapping("/login/market")
    @Operation(summary = "Login para Supermercados")
    public ResponseEntity<?> loginMarket(@RequestBody @Valid LoginRequestDTO dto) {
        try {
            Market market = authService.authenticateMarket(dto);
            
            String accessToken = tokenService.generateToken(market);
            String refreshToken = tokenService.generateRefreshToken(market);
            
            LoginResponseDTO response = new LoginResponseDTO(
                market.getId(),
                market.getName(),
                market.getEmail(),
                accessToken,
                refreshToken
            );
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Atualizar Access Token", description = "Gera um novo token de acesso usando o Refresh Token")
    public ResponseEntity<?> refreshToken(@RequestBody @Valid RefreshTokenRequestDTO dto) {
        try {
            String newAccessToken = authService.refreshAccessToken(dto.refreshToken());
            return ResponseEntity.ok(new TokenResponseDTO(newAccessToken));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}