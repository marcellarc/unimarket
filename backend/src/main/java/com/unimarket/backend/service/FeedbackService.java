package com.unimarket.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.FeedbackRequestDTO;
import com.unimarket.backend.dto.FeedbackResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Feedback;
import com.unimarket.backend.entity.Product;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.FeedbackRepository;
import com.unimarket.backend.repository.ProductRepository;

// Classe responsavel pelas regras de negocio dos feedbacks de produtos
@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ProductRepository productRepository;

    // Cadastra um novo feedback para um produto
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto) {

        Client client = findClientById(dto.getClientId());
        Product product = findProductById(dto.getProductId());

        Feedback feedback = new Feedback();
        feedback.setCliente(client);
        feedback.setProduct(product);
        feedback.setVlNota(dto.getVlNota());
        feedback.setDsComentario(normalizeComment(dto.getDsComentario()));

        Feedback savedFeedback = feedbackRepository.save(feedback);

        return toResponse(savedFeedback);
    }

    // Lista todos os feedbacks ativos
    public List<FeedbackResponseDTO> listFeedbacks() {

        return feedbackRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Busca um feedback ativo pelo ID
    public FeedbackResponseDTO findFeedbackById(Long id) {

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback nao encontrado"));

        return toResponse(feedback);
    }

    // Atualiza os dados de um feedback
    public FeedbackResponseDTO updateFeedback(Long id, FeedbackRequestDTO dto) {

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback nao encontrado"));

        Client client = findClientById(dto.getClientId());
        Product product = findProductById(dto.getProductId());

        feedback.setCliente(client);
        feedback.setProduct(product);
        feedback.setVlNota(dto.getVlNota());
        feedback.setDsComentario(normalizeComment(dto.getDsComentario()));

        Feedback updatedFeedback = feedbackRepository.save(feedback);

        return toResponse(updatedFeedback);
    }

    // Realiza o soft delete do feedback
    public void deleteFeedback(Long id) {

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback nao encontrado"));

        feedbackRepository.delete(feedback);
    }

    // Converte entidade Feedback para FeedbackResponseDTO
    private FeedbackResponseDTO toResponse(Feedback feedback) {

        FeedbackResponseDTO response = new FeedbackResponseDTO();

        response.setId(feedback.getCdFeedback());
        response.setClientId(feedback.getCliente().getId());
        response.setClientName(feedback.getCliente().getName());
        response.setProductId(feedback.getProduct().getId());
        response.setProductName(feedback.getProduct().getName());
        response.setVlNota(feedback.getVlNota());
        response.setDsComentario(feedback.getDsComentario());
        response.setCreatedAt(feedback.getCreatedAt());

        return response;
    }

    private String normalizeComment(String comment) {

        if (comment == null || comment.isBlank()) {
            return null;
        }

        return comment.trim();
    }

    private Client findClientById(Long clientId) {

        return clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cliente não encontrado"
        ));
    }

    private Product findProductById(Long productId) {

        return productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Produto não encontrado"
        ));
    }
}
