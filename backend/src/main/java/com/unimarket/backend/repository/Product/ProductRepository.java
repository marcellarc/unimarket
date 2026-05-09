package com.unimarket.backend.repository.product;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.product.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByBarCode(String barCode);
}
