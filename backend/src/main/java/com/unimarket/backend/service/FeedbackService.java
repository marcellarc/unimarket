package com.unimarket.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.unimarket.backend.dto.FeedbackRequestDTO;
import com.unimarket.backend.dto.FeedbackReplyRequestDTO;
import com.unimarket.backend.dto.FeedbackResponseDTO;
import com.unimarket.backend.entity.Client;
import com.unimarket.backend.entity.Feedback;
import com.unimarket.backend.entity.Market;
import com.unimarket.backend.entity.Product;
import com.unimarket.backend.repository.ClientRepository;
import com.unimarket.backend.repository.FeedbackRepository;
import com.unimarket.backend.repository.MarketProductRepository;
import com.unimarket.backend.repository.MarketRepository;
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

    @Autowired
    private MarketRepository marketRepository;

    @Autowired
    private MarketProductRepository marketProductRepository;

    // Cadastra um novo feedback para um produto
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO dto) {

        Client client = findClientById(dto.getClientId());
        Product product = findProductById(dto.getProductId());
        Market market = findMarketById(dto.getMarketId());
        validateProductBelongsToMarket(market.getId(), product.getId());

        Feedback feedback = new Feedback();
        feedback.setCliente(client);
        feedback.setProduct(product);
        feedback.setMarket(market);
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

    // Lista feedbacks ativos de um mercado especifico
    public List<FeedbackResponseDTO> listFeedbacksByMarket(Long marketId) {

        findMarketById(marketId);

        return feedbackRepository.findByMarketId(marketId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Busca um feedback ativo pelo ID
    public FeedbackResponseDTO findFeedbackById(Long id) {

        Feedback feedback = findFeedbackEntityById(id);

        return toResponse(feedback);
    }

    // Atualiza os dados de um feedback
    public FeedbackResponseDTO updateFeedback(Long id, FeedbackRequestDTO dto) {

        Feedback feedback = findFeedbackEntityById(id);

        Client client = findClientById(dto.getClientId());
        Product product = findProductById(dto.getProductId());
        Market market = findMarketById(dto.getMarketId());

        if (!feedback.getCliente().getId().equals(client.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Feedback não pertence a este cliente"
            );
        }

        validateProductBelongsToMarket(market.getId(), product.getId());

        feedback.setCliente(client);
        feedback.setProduct(product);
        feedback.setMarket(market);
        feedback.setVlNota(dto.getVlNota());
        feedback.setDsComentario(normalizeComment(dto.getDsComentario()));

        Feedback updatedFeedback = feedbackRepository.save(feedback);

        return toResponse(updatedFeedback);
    }

    // Permite que o mercado responda um feedback
    public FeedbackResponseDTO replyFeedback(Long id, FeedbackReplyRequestDTO dto) {

        Feedback feedback = findFeedbackEntityById(id);

        feedback.setMarketReply(dto.getReply().trim());
        feedback.setMarketRepliedAt(LocalDateTime.now());

        Feedback updatedFeedback = feedbackRepository.save(feedback);

        return toResponse(updatedFeedback);
    }

    // Realiza o soft delete do feedback
    public void deleteFeedback(Long id, Long clientId) {

        Feedback feedback = findFeedbackEntityById(id);
        Client client = findClientById(clientId);

        if (!feedback.getCliente().getId().equals(client.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Feedback não pertence a este cliente"
            );
        }

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

        if (feedback.getMarket() != null) {
            response.setMarketId(feedback.getMarket().getId());
            response.setMarketName(feedback.getMarket().getName());
        }

        response.setVlNota(feedback.getVlNota());
        response.setDsComentario(feedback.getDsComentario());
        response.setMarketReply(feedback.getMarketReply());
        response.setMarketRepliedAt(feedback.getMarketRepliedAt());
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

    private Market findMarketById(Long marketId) {

        return marketRepository.findById(marketId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Mercado não encontrado"
        ));
    }

    private Feedback findFeedbackEntityById(Long id) {

        return feedbackRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Feedback não encontrado"
        ));
    }

    private void validateProductBelongsToMarket(Long marketId, Long productId) {

        marketProductRepository.findByMarketIdAndProductId(marketId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Produto não vinculado a este mercado"
        ));
    }
}
