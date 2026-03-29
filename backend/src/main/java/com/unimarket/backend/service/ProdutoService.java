package com.unimarket.backend.service;

import com.unimarket.backend.entity.Produto;
import com.unimarket.backend.entity.Categoria;
import com.unimarket.backend.repository.ProdutoRepository;
import com.unimarket.backend.repository.CategoriaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// Classe responsável pelas regras de negócio do Produto
@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    // Injeta o repository de categoria para buscar no banco
    @Autowired
    private CategoriaRepository categoriaRepository;

    // Criar um novo produto
    public Produto criarProduto(Produto produto) {

        // Pega o ID da categoria que veio no JSON
        Long cdCategoria = produto.getCategoria().getCdCategoria();

        // Busca a categoria no banco
        Categoria categoria = categoriaRepository.findById(cdCategoria)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        // Substitui a categoria "fake" pela categoria real do banco
        produto.setCategoria(categoria);

        // Salva o produto no banco
        return produtoRepository.save(produto);
    }

    // Listar todos os produtos
    public List<Produto> listarProdutos() {
        return produtoRepository.findAll();
    }

    // Buscar produtos pelo nome
    public List<Produto> buscarPorNome(String nome) {
        return produtoRepository.findByNmProdutoContainingIgnoreCase(nome);
    }

    // Buscar produto por ID
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }
}