package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.entity.Cliente;
import com.unimarket.backend.repository.ClientRepository;

@Service
public class ClientService {

    @Autowired
    private ClientRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Cliente register(ClientDTO dto) {

        // Verifica se o email já está cadastrado
        if (repository.findByDsEmail(dto.getDsEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Converte DTO para Entity
        Cliente cliente = modelMapper.map(dto, Cliente.class);

        // Criptografa a senha
        cliente.setDsSenha(passwordEncoder.encode(dto.getDsSenha()));

        // Salva no banco
        return repository.save(cliente);
    }
}