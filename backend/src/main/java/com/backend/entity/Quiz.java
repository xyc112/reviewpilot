package com.backend.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quiz")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    private String id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Convert(converter = QuestionListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<Question> questions;

    private Long authorId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Question {
        private String id; // e.g. q10-1
        private String type; // single|multiple|truefalse
        private String question;
        private List<String> options;
        /**
         * 只有创建/管理员/作者可见；普通用户视图中置为 null
         * 存储为选项索引列表（0-based）
         */
        private List<Integer> answer;
    }

    // Converter for List<Question> <-> JSON
    public static class QuestionListConverter implements AttributeConverter<List<Question>, String> {
        private static final ObjectMapper M = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<Question> attribute) {
            try {
                if (attribute == null) return null;
                return M.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert questions to JSON", e);
            }
        }

        @Override
        public List<Question> convertToEntityAttribute(String dbData) {
            try {
                if (dbData == null || dbData.isBlank()) return null;
                return M.readValue(dbData, new TypeReference<List<Question>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert JSON to questions", e);
            }
        }
    }
}
