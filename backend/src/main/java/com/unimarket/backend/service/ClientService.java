package com.unimarket.backend.service;

import java.util.Locale;
import java.util.UUID;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.ClientDTO;
import com.unimarket.backend.dto.ClientProfileResponseDTO;
import com.unimarket.backend.dto.ClientProfileUpdateDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.service.GoogleAuthService.GoogleAccount;

import jakarta.transaction.Transactional;

@Service
public class ClientService {

    @Autowired
    private ClientRepository repository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Cadastro publico do cliente. A senha nunca deve ser salva em texto puro.
    public Client register(ClientDTO dto) {
        if (repository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        Client client = modelMapper.map(dto, Client.class);
        client.setPassword(passwordEncoder.encode(dto.getPassword()));

        return repository.save(client);
    }

    @Transactional
    public Client findOrCreateGoogleClient(GoogleAccount account) {
        String email = account.email().trim().toLowerCase(Locale.ROOT);

        return repository.findByGoogleSubject(account.subject())
                .map(existingClient -> linkGoogleAccount(existingClient, account))
                .or(() -> repository.findByEmail(email)
                        .map(existingClient -> linkGoogleAccount(existingClient, account)))
                .orElseGet(() -> {
                    Client client = new Client();
                    client.setEmail(email);
                    client.setName(generateAvailableName(account.name(), email));
                    client.setGoogleSubject(account.subject());
                    client.setProfileImageUrl(emptyToNull(account.pictureUrl()));
                    client.setPassword(passwordEncoder.encode(UUID.randomUUID() + ":" + account.subject()));

                    return repository.save(client);
                });
    }

    // Retorna o perfil completo usado pela tela de perfil do cliente.
    public ClientProfileResponseDTO getCurrentProfile(Client authenticatedClient) {
        Client client = repository.findById(authenticatedClient.getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        return toProfileResponse(client);
    }

    @Transactional
    public ClientProfileResponseDTO updateCurrentProfile(Client authenticatedClient, ClientProfileUpdateDTO dto) {
        // Busca novamente no banco para evitar atualizar uma entidade antiga do token.
        Client client = repository.findById(authenticatedClient.getId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            client.setName(dto.getName().trim());
        }

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
            repository.findByEmail(email)
                    .filter(existingClient -> !existingClient.getId().equals(client.getId()))
                    .ifPresent(existingClient -> {
                        throw new RuntimeException("E-mail já cadastrado");
                    });

            client.setEmail(email);
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            // Mudanca de senha exige a senha atual para reduzir risco de troca indevida.
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
            // CEP fica normalizado sem mascara para facilitar comparacoes e integracoes.
            String zipCode = onlyDigits(dto.getZipCode());
            client.setZipCode(zipCode.isEmpty() ? null : zipCode);
        }

        if (dto.getLatitude() != null) {
            client.setLatitude(dto.getLatitude());
        } else if (dto.getLocationSource() != null) {
            client.setLatitude(null);
        }

        if (dto.getLongitude() != null) {
            client.setLongitude(dto.getLongitude());
        } else if (dto.getLocationSource() != null) {
            client.setLongitude(null);
        }

        if (dto.getLocationSource() != null) {
            client.setLocationSource(emptyToNull(dto.getLocationSource()));
        }

        if (dto.getProfileImageUrl() != null) {
            client.setProfileImageUrl(emptyToNull(dto.getProfileImageUrl()));
        }

        if (dto.getSearchRadiusKm() != null) {
            // Limita o raio para manter a busca por localizacao util e previsivel.
            client.setSearchRadiusKm(Math.max(1, Math.min(30, dto.getSearchRadiusKm())));
        }

        if (dto.getPriceAlertsEnabled() != null) {
            client.setPriceAlertsEnabled(dto.getPriceAlertsEnabled());
        }

        if (dto.getWeeklySummaryEnabled() != null) {
            client.setWeeklySummaryEnabled(dto.getWeeklySummaryEnabled());
        }

        if (dto.getBrowserPushEnabled() != null) {
            client.setBrowserPushEnabled(dto.getBrowserPushEnabled());
        }

        return toProfileResponse(repository.save(client));
    }

    @Transactional
    public void deleteClient(Long id) {
        // O delete real e interceptado pelo @SQLDelete da entidade Client.
        Client client = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        repository.delete(client);
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
                valueOrDefault(client.getPriceAlertsEnabled(), true),
                valueOrDefault(client.getWeeklySummaryEnabled(), true),
                valueOrDefault(client.getBrowserPushEnabled(), false),
                client.getCreatedAt()
        );
    }

    private Boolean valueOrDefault(Boolean value, Boolean fallback) {
        return value == null ? fallback : value;
    }

    private String emptyToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private String onlyDigits(String value) {
        return value == null ? "" : value.replaceAll("\\D", "");
    }

    private Client linkGoogleAccount(Client client, GoogleAccount account) {
        client.setGoogleSubject(account.subject());

        if (shouldUseGoogleProfileImage(client, account.pictureUrl())) {
            client.setProfileImageUrl(account.pictureUrl());
        }

        return repository.save(client);
    }

    private boolean shouldUseGoogleProfileImage(Client client, String googlePictureUrl) {
        if (googlePictureUrl == null || googlePictureUrl.isBlank()) {
            return false;
        }

        String currentImageUrl = client.getProfileImageUrl();
        return currentImageUrl == null
                || currentImageUrl.isBlank()
                || currentImageUrl.toLowerCase(Locale.ROOT).contains("googleusercontent.com");
    }

    private String generateAvailableName(String googleName, String email) {
        String baseName = googleName == null || googleName.trim().isEmpty()
                ? email.substring(0, email.indexOf('@'))
                : googleName.trim();

        String candidate = baseName;
        int suffix = 2;

        while (repository.existsByName(candidate)) {
            candidate = baseName + " " + suffix;
            suffix++;
        }

        return candidate;
    }
}
