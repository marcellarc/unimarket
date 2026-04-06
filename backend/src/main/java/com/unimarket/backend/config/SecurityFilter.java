package com.unimarket.backend.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.MarketRepository;
import com.unimarket.backend.service.TokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        var token = this.recoverToken(request);

        if (token != null) {
            var email = tokenService.validateToken(token);

            if (!email.isEmpty()) {
                // 1. Tenta achar como Mercado
                Market market = marketRepository.findByEmail(email).orElse(null);

                if (market != null) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(market, null, null); // Idealmente passar as authorities aqui no último parâmetro
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // 2. Se não achou no Mercado, tenta achar como Cliente!
                    Client client = clientRepository.findByEmail(email).orElse(null);

                    if (client != null) {
                        var authentication = new UsernamePasswordAuthenticationToken(client, null, null);
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    // Método auxiliar para limpar a palavra "Bearer " que o React costuma enviar junto com o token
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}
