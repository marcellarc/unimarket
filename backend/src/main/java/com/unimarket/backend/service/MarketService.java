package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.MarketDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.MarketRepository;


@Service
public class MarketService {

    @Autowired
    private MarketRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
         * Classe responsável pela lógica de negócio do sistema.
         * 
         * O Service atua como intermediário entre o Controller e o Repository:
         * - Recebe os dados vindos do Controller (DTO)
         * - Aplica regras de negócio (validações, tratamentos, etc.)
         * - Realiza transformações necessárias (ex: criptografia de senha)
         * - Envia os dados para o Repository salvar no banco
         * 
         * Exemplo neste contexto:
         * - Verifica se o CNPJ já está cadastrado
         * - Criptografa a senha do supermercado
         * - Define a data de cadastro automaticamente
     */

    public Market register(MarketDTO dto) {
        if (repository.findByCnpj(dto.getCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }
        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Market market = modelMapper.map(dto, Market.class);
        market.setPassword(passwordEncoder.encode(dto.getPassword()));
        return repository.save(market);
    }
}