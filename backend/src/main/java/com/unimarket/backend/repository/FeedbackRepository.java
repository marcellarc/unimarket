package com.unimarket.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    @Override
    @EntityGraph(attributePaths = {"cliente", "product", "market"})
    List<Feedback> findAll();

    @EntityGraph(attributePaths = {"cliente", "product", "market"})
    List<Feedback> findByMarketId(Long marketId);
}
