package com.unimarket.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.login.LoginRequestDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.MarketRepository;

@Service
public class AuthService {

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    public Market authenticateMarket(LoginRequestDTO dto) {
        Market market = marketRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.password(), market.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        market.setPassword(null); //talvez mudar
        return market;
    }

    // novo método para Cliente
    public Client authenticateClient(LoginRequestDTO dto) {
        Client client = clientRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(dto.password(), client.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        client.setPassword(null); // opcional: evitar expor senha na resposta
        return client;
    }

    public String refreshAccessToken(String refreshToken) {
        String email = tokenService.validateToken(refreshToken);

        if (email.isEmpty()) {
            throw new RuntimeException("Refresh Token inválido ou expirado. Faça login novamente.");
        }

        Market market = marketRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        return tokenService.generateToken(market);
    }
}
