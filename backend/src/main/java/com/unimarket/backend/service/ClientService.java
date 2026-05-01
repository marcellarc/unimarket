package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.repository.ClientRepository;

@Service
public class ClientService {

    @Autowired
    private ClientRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Client register(ClientDTO dto) {

        // Verifica se o email já está cadastrado
        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        // Converte DTO para Entity
        Client client = modelMapper.map(dto, Client.class);

        // Criptografa a senha
        client.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Salva no banco
        return repository.save(client);
    }


    // realiza o soft delete do cliente
    public void deleteClient(Long id) {
        // verifica se o cliente existe
        Client client = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        // @SQLDelete intercepta e executa UPDATE deleted_at em vez de DELETE
        repository.delete(client);
    }
}
