package com.reviewpilot.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Data
@Slf4j
@Entity
@Table(name = "user_notes")
public class UserNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noteId;

    @Lob
    private String content;

    @Column(columnDefinition = "JSON")
    private String attachments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_id", nullable = false)
    private KnowledgePoint knowledgePoint;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}