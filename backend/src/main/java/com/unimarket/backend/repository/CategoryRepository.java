package com.unimarket.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
