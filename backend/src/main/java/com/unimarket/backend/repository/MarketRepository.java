package com.unimarket.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Market;

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
 * - Verifica se já existe um supermercado com o mesmo CNPJ ou Email
 * - Persiste os dados do mercado no banco
 */
public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByCnpj(String cnpj);

    Optional<Market> findByEmail(String email);
}