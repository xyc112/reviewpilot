package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "note")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {
    @Id
    private String id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * 笔记摘要，用于列表预览
     */
    @Column(columnDefinition = "TEXT")
    private String summary;

    private Long authorId;

    /**
     * "public" 或 "private"（默认 private）
     */
    private String visibility;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.visibility == null) this.visibility = "private";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
