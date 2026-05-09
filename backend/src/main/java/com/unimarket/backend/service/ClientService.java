package com.unimarket.backend.service;

import java.util.Locale;

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
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        return toProfileResponse(client);
    }

    @Transactional
    public ClientProfileResponseDTO updateCurrentProfile(Client authenticatedClient, ClientProfileUpdateDTO dto) {
        Client client = repository.findById(authenticatedClient.getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

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
            if (dto.getCurrentPassword() == null || dto.getCurrentPassword().trim().isEmpty()) {
                throw new RuntimeException("Informe a senha atual para definir uma nova senha");
            }

            if (!passwordEncoder.matches(dto.getCurrentPassword(), client.getPassword())) {
                throw new RuntimeException("Senha atual inválida");
            }

            client.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getStreetAddress() != null) {
            client.setStreetAddress(emptyToNull(dto.getStreetAddress()));
        }

        if (dto.getNeighborhood() != null) {
            client.setNeighborhood(emptyToNull(dto.getNeighborhood()));
        }

        if (dto.getCity() != null) {
            client.setCity(emptyToNull(dto.getCity()));
        }

        if (dto.getState() != null) {
            client.setState(emptyToNull(dto.getState()) == null ? null : dto.getState().trim().toUpperCase(Locale.ROOT));
        }

        if (dto.getZipCode() != null) {
            String zipCode = onlyDigits(dto.getZipCode());
            client.setZipCode(zipCode.isEmpty() ? null : zipCode);
        }

        if (dto.getLatitude() != null) {
            client.setLatitude(dto.getLatitude());
        }

        if (dto.getLongitude() != null) {
            client.setLongitude(dto.getLongitude());
        }

        if (dto.getLocationSource() != null) {
            client.setLocationSource(emptyToNull(dto.getLocationSource()));
        }

        if (dto.getProfileImageUrl() != null) {
            client.setProfileImageUrl(emptyToNull(dto.getProfileImageUrl()));
        }

        if (dto.getSearchRadiusKm() != null) {
            client.setSearchRadiusKm(Math.max(1, Math.min(30, dto.getSearchRadiusKm())));
        }

        return toProfileResponse(repository.save(client));
    }

    private ClientProfileResponseDTO toProfileResponse(Client client) {
        return new ClientProfileResponseDTO(
                client.getId(),
                client.getName(),
                client.getEmail(),
                client.getStreetAddress(),
                client.getNeighborhood(),
                client.getCity(),
                client.getState(),
                client.getZipCode(),
                client.getLatitude(),
                client.getLongitude(),
                client.getLocationSource(),
                client.getProfileImageUrl(),
                client.getSearchRadiusKm(),
                client.getCreatedAt()
        );
    }

    private String emptyToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }
}
