package com.unimarket.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.LoginRequest;
import com.unimarket.backend.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    //Endpoint que o front vai chamar

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}