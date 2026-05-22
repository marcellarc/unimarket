package com.unimarket.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.dto.MarketDTO;
import com.unimarket.backend.dto.login.GoogleLoginRequestDTO;
import com.unimarket.backend.dto.login.LoginRequestDTO;
import com.unimarket.backend.dto.login.LoginResponseDTO;
import com.unimarket.backend.dto.token.RefreshTokenRequestDTO;
import com.unimarket.backend.dto.token.TokenResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.service.AuthService;
import com.unimarket.backend.service.ClientService;
import com.unimarket.backend.service.GoogleAuthService;
import com.unimarket.backend.service.GoogleAuthService.GoogleAccount;
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

    @Autowired
    private ClientService clientService;

    @Autowired
    private GoogleAuthService googleAuthService;

    //cadastro cliente
    @PostMapping("/register/client")
    @Operation(summary = "Cadastrar um novo cliente")
    public Client register(@Valid @RequestBody ClientDTO dto) {
        return clientService.register(dto);
    }

    //login cliente
    @PostMapping("/login/client")
    @Operation(summary = "Login para clientes")
    public ResponseEntity<?> loginClient(@RequestBody @Valid LoginRequestDTO dto) {
        try {
            Client client = authService.authenticateClient(dto);

            String accessToken = tokenService.generateToken(client);
            String refreshToken = tokenService.generateRefreshToken(client);

            LoginResponseDTO response = new LoginResponseDTO(
                    client.getId(),
                    client.getName(),
                    client.getEmail(),
                    accessToken,
                    refreshToken
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/login/google/client")
    @Operation(summary = "Login com Google para clientes")
    public ResponseEntity<?> loginGoogleClient(@RequestBody @Valid GoogleLoginRequestDTO dto) {
        try {
            GoogleAccount googleAccount = googleAuthService.verifyIdToken(dto.idToken());
            Client client = clientService.findOrCreateGoogleClient(googleAccount);

            String accessToken = tokenService.generateToken(client);
            String refreshToken = tokenService.generateRefreshToken(client);

            LoginResponseDTO response = new LoginResponseDTO(
                    client.getId(),
                    client.getName(),
                    client.getEmail(),
                    accessToken,
                    refreshToken
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    //cadastro mercado
    @PostMapping("/register/market")
    @Operation(summary = "Cadastrar um novo supermercado")
    public ResponseEntity<Market> registerMarket(@RequestBody @Valid MarketDTO dto) {
        return ResponseEntity.ok(marketService.register(dto));
    }

    //login mercado
    @PostMapping("/login/market")
    @Operation(summary = "Login para supermercados")
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

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Apenas retorna sucesso. A exclusão real dos tokens deve ser feita no Front-end.")
    public ResponseEntity<String> logout() {

        return ResponseEntity.ok("Logout autorizado. O cliente deve remover os tokens localmente.");
    }
}
