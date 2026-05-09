package com.unimarket.backend.repository.Product;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Product.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByBarCode(String barCode);
}
