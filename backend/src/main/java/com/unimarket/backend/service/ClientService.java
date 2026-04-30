package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.dto.ClientProfileResponseDTO;
import com.unimarket.backend.dto.ClientProfileUpdateDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.repository.ClientRepository;

import jakarta.transaction.Transactional;

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

    public ClientProfileResponseDTO getCurrentProfile(Client authenticatedClient) {
        Client client = repository.findById(authenticatedClient.getId())
                .orElseThrow(() -> new RuntimeException("Cliente nao encontrado"));

        return toProfileResponse(client);
    }

    @Transactional
    public ClientProfileResponseDTO updateCurrentProfile(Client authenticatedClient, ClientProfileUpdateDTO dto) {
        Client client = repository.findById(authenticatedClient.getId())
                .orElseThrow(() -> new RuntimeException("Cliente nao encontrado"));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            client.setName(dto.getName().trim());
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            String email = dto.getEmail().trim().toLowerCase();
            repository.findByEmail(email)
                    .filter(existingClient -> !existingClient.getId().equals(client.getId()))
                    .ifPresent(existingClient -> {
                        throw new RuntimeException("Email ja cadastrado");
                    });

            client.setEmail(email);
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            client.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return toProfileResponse(repository.save(client));
    }

    private ClientProfileResponseDTO toProfileResponse(Client client) {
        return new ClientProfileResponseDTO(
                client.getId(),
                client.getName(),
                client.getEmail(),
                client.getCreatedAt()
        );
    }
}
