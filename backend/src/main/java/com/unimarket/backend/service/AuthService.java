package com.unimarket.backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.LoginRequest;
import com.unimarket.backend.model.User;
import com.unimarket.backend.repository.UserRepository;
import com.unimarket.backend.security.JwtService;

@Service
public class AuthService {

//valida o usuario e senha

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.jwtService = new JwtService();
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        if (!encoder.matches(request.getSenha(), user.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        return jwtService.generateToken(user.getEmail());
    }
}