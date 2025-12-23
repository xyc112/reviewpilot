package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "wrong_question",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "question_id"}),
       indexes = {
           @Index(columnList = "user_id"),
           @Index(columnList = "course_id"),
           @Index(columnList = "user_id, course_id")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WrongQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "quiz_id", nullable = false)
    private String quizId;

    /**
     * 用户提交的错误答案（存储为选项索引列表）
     */
    @ElementCollection
    @CollectionTable(name = "wrong_question_user_answers", joinColumns = @JoinColumn(name = "wrong_question_id"))
    @Column(name = "answer_index")
    private java.util.List<Integer> userAnswer;

    /**
     * 是否已掌握（用户标记）
     */
    @Column(nullable = false)
    private Boolean mastered;

    /**
     * 添加到错题本的时间
     */
    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    /**
     * 最后练习时间
     */
    @Column(name = "last_practiced_at")
    private LocalDateTime lastPracticedAt;

    /**
     * 练习次数
     */
    @Column(name = "practice_count", nullable = false)
    private Integer practiceCount;

    /**
     * 关联的题目信息（不持久化）
     */
    @Transient
    private Question question;

    @PrePersist
    public void prePersist() {
        if (this.mastered == null) {
            this.mastered = false;
        }
        if (this.addedAt == null) {
            this.addedAt = LocalDateTime.now();
        }
        if (this.practiceCount == null) {
            this.practiceCount = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (this.lastPracticedAt == null && this.practiceCount > 0) {
            this.lastPracticedAt = LocalDateTime.now();
        }
    }
}

