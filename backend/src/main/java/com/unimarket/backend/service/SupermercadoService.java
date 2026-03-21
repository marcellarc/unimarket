package com.unimarket.backend.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.SupermercadoDTO;
import com.unimarket.backend.entity.Supermercado;
import com.unimarket.backend.repository.SupermercadoRepository;


@Service
public class SupermercadoService {

    @Autowired
    private SupermercadoRepository repository;

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

    public Supermercado cadastrar(SupermercadoDTO dto) {

        if (repository.findByDsCnpj(dto.getDsCnpj()).isPresent()) {
            throw new RuntimeException("CNPJ já cadastrado");
        }

        if (repository.findByDsEmail(dto.getDsEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Supermercado supermercado = modelMapper.map(dto, Supermercado.class);

        supermercado.setDsSenha(passwordEncoder.encode(dto.getDsSenha()));

        return repository.save(supermercado);
    }
}