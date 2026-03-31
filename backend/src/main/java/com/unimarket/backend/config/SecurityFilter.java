package com.unimarket.backend.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.unimarket.backend.entity.Market;
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

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Pega o token que vem do Front-end
        var token = this.recoverToken(request);
        
        if (token != null) {
            // 2. Valida o token e pega o email
            var email = tokenService.validateToken(token);

            if (!email.isEmpty()) {
                // 3. Busca o mercado no banco de dados
                Market market = marketRepository.findByEmail(email).orElse(null);

                if (market != null) {
                    // 4. Diz para o Spring Security: "Pode deixar passar, esse cara está logado!"
                    var authentication = new UsernamePasswordAuthenticationToken(market, null, null);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        
        // 5. Continua o fluxo (vai para o Controller)
        filterChain.doFilter(request, response);
    }

    // Método auxiliar para limpar a palavra "Bearer " que o React costuma enviar junto com o token
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}