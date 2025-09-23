package com.reviewpilot.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;

@Data
@Slf4j
@Entity
@Table(name = "user_scores")
public class UserScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scoreId;

    private Double scoreValue;

    private LocalDate examDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_id", nullable = false)
    private KnowledgePoint knowledgePoint;
}