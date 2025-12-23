package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "question")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private String quizId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    /**
     * 原始题目ID（来自Quiz.Question.id，如"q1-1"）
     */
    @Column(name = "original_id")
    private String originalId;

    @Column(nullable = false)
    private String type; // single|multiple|truefalse

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option")
    private List<String> options;

    /**
     * 正确答案，存储为选项索引列表（0-based）
     * 只有创建/管理员/作者可见；普通用户视图中置为 null
     */
    @ElementCollection
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "answer_index")
    private List<Integer> answer;

    /**
     * 题目解析（可选）
     */
    @Column(columnDefinition = "TEXT")
    private String explanation;

    /**
     * 题目在测验中的顺序
     */
    private Integer orderIndex;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}

