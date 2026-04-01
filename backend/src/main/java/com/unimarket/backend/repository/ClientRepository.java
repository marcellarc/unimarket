package com.unimarket.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Cliente;

/**
 * Interface responsável pelo acesso aos dados no banco.
 * * O Repository faz a comunicação direta com o banco de dados,
 * utilizando o Spring Data JPA para abstrair consultas SQL.
 * * Suas principais responsabilidades:
 * - Salvar entidades no banco (save)
 * - Buscar registros (findById, findAll)
 * - Verificar existência de dados (existsBy...)
 * - Deletar registros
 * * Neste contexto:
 * - Verifica se já existe um cliete com o mesmo Email
 * - Persiste os dados do cliente no banco
 */
public interface ClientRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDsEmail(String dsEmail);

}