package com.unimarket.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.unimarket.backend.dto.MercadoProdutoRequest;
import com.unimarket.backend.dto.MercadoProdutoResponse;
import com.unimarket.backend.dto.ProdutoRequest;
import com.unimarket.backend.dto.ProdutoResponse;
import com.unimarket.backend.entity.Categoria;
import com.unimarket.backend.entity.Mercado;
import com.unimarket.backend.entity.MercadoProduto;
import com.unimarket.backend.entity.Produto;
import com.unimarket.backend.repository.CategoriaRepository;
import com.unimarket.backend.repository.MercadoProdutoRepository;
import com.unimarket.backend.repository.MercadoRepository;
import com.unimarket.backend.repository.ProdutoRepository;


// Classe responsável pelas regras de negócio do vínculo entre Mercado e Produto
@Service
public class MercadoProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private MercadoRepository mercadoRepository;

    @Autowired
    private MercadoProdutoRepository mercadoProdutoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    // Cadastra produto e cria o vínculo com o mercado
    public ProdutoResponse cadastrarProduto(ProdutoRequest dto, Long cdMercado) {

        // verifica se o mercado existe
        Mercado mercado = mercadoRepository.findById(cdMercado)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // verifica se o produto já existe pelo código de barras
        Optional<Produto> produtoExistente = produtoRepository.findByDsCodBarra(dto.getDsCodBarra());

        Produto produto;

        if (produtoExistente.isPresent()) {
            // produto já existe no catálogo — usa o existente
            produto = produtoExistente.get();

            // verifica se o vínculo entre este mercado e produto já existe
            boolean vinculoExiste = mercadoProdutoRepository
                    .findBySupermercadoCdMercadoAndProdutoCdProduto(cdMercado, produto.getCdProduto())
                    .isPresent();

            if (vinculoExiste) {
                throw new RuntimeException("Este mercado já possui este produto");
            }

        } else {
            // produto novo — busca a categoria e salva no catálogo
            Categoria categoria = categoriaRepository.findById(dto.getCdCategoria())
                    .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

            // monta a entidade com os dados do DTO
            produto = new Produto();
            produto.setNmProduto(dto.getNmProduto());
            produto.setNmMarca(dto.getNmMarca());
            produto.setDsProduto(dto.getDsProduto());
            produto.setDsImgProduto(dto.getDsImgProduto());
            produto.setDsCodBarra(dto.getDsCodBarra());
            produto.setCategoria(categoria);

            // salva o produto no catálogo global
            produto = produtoRepository.save(produto);
        }

        // cria o vínculo entre mercado e produto (sem preço e estoque por enquanto)
        MercadoProduto vinculo = new MercadoProduto();
        vinculo.setProduto(produto);
        vinculo.setSupermercado(mercado);
        mercadoProdutoRepository.save(vinculo);

        // retorna os dados do produto cadastrado
        return toResponse(produto);
    }

    // Lista todos os produtos vinculados a um mercado específico
    public List<ProdutoResponse> listarProdutosPorMercado(Long cdMercado) {

        // verifica se o mercado existe
        mercadoRepository.findById(cdMercado)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // busca todos os vínculos do mercado e mapeia para DTO
        return mercadoProdutoRepository.findBySupermercadoCdMercado(cdMercado)
                .stream()
                .map(vinculo -> toResponse(vinculo.getProduto()))
                .collect(Collectors.toList());
    }

    // Busca produtos de um mercado pelo nome
    public List<ProdutoResponse> buscarPorNome(Long cdMercado, String nome) {

        // verifica se o mercado existe
        mercadoRepository.findById(cdMercado)
                .orElseThrow(() -> new RuntimeException("Mercado não encontrado"));

        // busca os vínculos do mercado e filtra pelo nome do produto
        return mercadoProdutoRepository.findBySupermercadoCdMercado(cdMercado)
                .stream()
                .filter(vinculo -> vinculo.getProduto().getNmProduto()
                        .toLowerCase().contains(nome.toLowerCase())) // filtra ignorando maiúsculas/minúsculas
                .map(vinculo -> toResponse(vinculo.getProduto()))
                .collect(Collectors.toList());
    }

    // Busca um produto específico de um mercado pelo ID do produto
    public ProdutoResponse buscarPorId(Long cdMercado, Long cdProduto) {

        // verifica se o vínculo entre o mercado e o produto existe
        MercadoProduto vinculo = mercadoProdutoRepository
                .findBySupermercadoCdMercadoAndProdutoCdProduto(cdMercado, cdProduto)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado para este mercado"));

        // retorna os dados do produto vinculado
        return toResponse(vinculo.getProduto());
    }

    // Converte entidade Produto para ProdutoResponse
    private ProdutoResponse toResponse(Produto produto) {
        ProdutoResponse response = new ProdutoResponse();
        response.setCdProduto(produto.getCdProduto());
        response.setNmProduto(produto.getNmProduto());
        response.setNmMarca(produto.getNmMarca());
        response.setDsProduto(produto.getDsProduto());
        response.setDsImgProduto(produto.getDsImgProduto());
        response.setDsCodBarra(produto.getDsCodBarra());
        response.setDtCadastro(produto.getDtCadastro().toLocalDate());

        // pega o nome da categoria se existir
        if (produto.getCategoria() != null) {
            response.setNmCategoria(produto.getCategoria().getNmCategoria());
        }

        return response;
    }


    // Atualiza preço e estoque de um produto vinculado a um mercado
    public MercadoProdutoResponse atualizarPrecoEstoque(Long cdMercado, Long cdProduto, MercadoProdutoRequest dto) {

        // busca o vínculo entre o mercado e o produto
        MercadoProduto vinculo = mercadoProdutoRepository
                .findBySupermercadoCdMercadoAndProdutoCdProduto(cdMercado, cdProduto)
                .orElseThrow(() -> new RuntimeException("Vínculo entre mercado e produto não encontrado"));

        // atualiza os valores recebidos no DTO
        vinculo.setVlPreco(dto.getVlPreco());
        vinculo.setQtEstoque(dto.getQtEstoque());

        // salva o vínculo atualizado no banco
        MercadoProduto atualizado = mercadoProdutoRepository.save(vinculo);

        // converte e retorna o response
        return toMercadoProdutoResponse(atualizado);
    }

    // Converte entidade MercadoProduto para MercadoProdutoResponse
    private MercadoProdutoResponse toMercadoProdutoResponse(MercadoProduto vinculo) {
        MercadoProdutoResponse response = new MercadoProdutoResponse();
        response.setCdMercProd(vinculo.getCdMercProd());
        response.setNmMercado(vinculo.getSupermercado().getNmMercado()); // nome do mercado
        response.setNmProduto(vinculo.getProduto().getNmProduto());       // nome do produto
        response.setNmMarca(vinculo.getProduto().getNmMarca());           // marca do produto
        response.setVlPreco(vinculo.getVlPreco());
        response.setQtEstoque(vinculo.getQtEstoque());
        response.setDtAtualizacao(vinculo.getDtAtualizacao());
        return response;
    }
}