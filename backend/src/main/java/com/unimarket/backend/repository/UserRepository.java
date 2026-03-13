package com.unimarket.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.model.User;

//Responsável por acessar o banco

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}