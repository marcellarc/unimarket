package com.unimarket.backend.controller;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.unimarket.backend.dto.CategoryRequestDTO;
import com.unimarket.backend.dto.CategoryResponseDTO;
import com.unimarket.backend.entity.Category;
import com.unimarket.backend.repository.CategoryRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Categories", description = "API para consulta de categorias de produtos")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Operation(summary = "Listar categorias de produtos")
    @GetMapping
    public List<CategoryResponseDTO> listCategories() {
        return categoryRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(category -> new CategoryResponseDTO(category.getId(), category.getName()))
                .toList();
    }

    @Operation(summary = "Cadastrar categoria de produto")
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO dto) {
        String normalizedName = dto.getName().trim();

        categoryRepository.findByNameIgnoreCase(normalizedName)
                .ifPresent(category -> {
                    throw new RuntimeException("Categoria ja cadastrada");
                });

        Category category = new Category();
        category.setName(normalizedName);

        Category savedCategory = categoryRepository.save(category);
        CategoryResponseDTO response = new CategoryResponseDTO(savedCategory.getId(), savedCategory.getName());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
