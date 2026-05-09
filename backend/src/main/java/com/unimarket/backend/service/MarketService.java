package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.MarketDTO;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.repository.MarketRepository;
import com.unimarket.backend.repository.Product.MarketProductRepository;

// classe responsável pela lógica de negócio do Market
@Service
public class MarketService {

    @Autowired
    private MarketRepository repository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // registra um novo mercado verificando duplicatas de CNPJ e email
    public Market register(MarketDTO dto) {

        // verifica se o CNPJ já está cadastrado
        if (repository.findByCnpj(dto.getCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }

        // verifica se o email já está cadastrado
        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        // converte DTO para entidade e criptografa a senha
        Market market = modelMapper.map(dto, Market.class);
        market.setPassword(passwordEncoder.encode(dto.getPassword()));
        return repository.save(market);
    }

    // realiza o soft delete do mercado e de todos os seus vínculos com produtos
    public void deleteMarket(Long id) {

        // verifica se o mercado existe
        Market market = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // soft delete de todos os vínculos do mercado com produtos
        marketProductRepository.findByMarketId(id)
                .forEach(vinculo -> marketProductRepository.delete(vinculo));

        // soft delete do mercado
        repository.delete(market);
    }
}