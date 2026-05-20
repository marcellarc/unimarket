package com.unimarket.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unimarket.backend.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}
