package com.unimarket.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Categoria;

// Interface para acessar o banco de dados da entidade Categoria
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}