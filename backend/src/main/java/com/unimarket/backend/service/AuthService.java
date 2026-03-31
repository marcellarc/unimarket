package com.unimarket.backend.service;

import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.LoginRequest;
import com.unimarket.backend.entity.Cliente;
import com.unimarket.backend.repository.ClienteRepository;
import com.unimarket.backend.security.JwtService;

@Service
public class AuthService {

//valida o usuario e senha

    private final ClienteRepository clienteRepository;
    private final JwtService jwtService;

    public AuthService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
        this.jwtService = new JwtService();
    }

    public String login(LoginRequest request) {

        Cliente cliente = clienteRepository.findByDsEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!cliente.getDsSenha().equals(request.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        return jwtService.generateToken(cliente.getDsEmail());
    }
}