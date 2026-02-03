package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 学习进度实体
 * 记录用户在课程中的学习成果，包括测验完成情况和统计信息
 */
@Entity
@Table(name = "progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id", "quiz_id"}),
       indexes = {
           @Index(columnList = "user_id"),
           @Index(columnList = "course_id"),
           @Index(columnList = "user_id, course_id")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Progress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    /**
     * 测验ID，如果为空则表示课程级别的统计
     */
    @Column(name = "quiz_id")
    private String quizId;

    /**
     * 测验得分（0-100）
     */
    private Integer score;

    /**
     * 总分（通常为100）
     */
    private Integer totalScore;

    /**
     * 是否完成（对于测验，表示是否完成；对于课程，表示是否完成所有测验）
     */
    @Column(nullable = false)
    private Boolean completed;

    /**
     * 完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * 最后访问时间
     */
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @PrePersist
    public void prePersist() {
        if (this.completed == null) {
            this.completed = false;
        }
        if (this.lastAccessedAt == null) {
            this.lastAccessedAt = LocalDateTime.now();
        }
        if (this.completed && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.lastAccessedAt = LocalDateTime.now();
        if (this.completed && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
    }
}

