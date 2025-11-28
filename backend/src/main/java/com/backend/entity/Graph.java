package com.backend.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "graph")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Graph {
    /**
     * 使用 courseId 作为主键（每门课程一张图）
     */
    @Id
    @Column(name = "course_id")
    private Long courseId;

    @Convert(converter = NodeListConverter.class)
    @Column(name = "nodes", columnDefinition = "TEXT")
    private List<Node> nodes;

    @Convert(converter = RelationListConverter.class)
    @Column(name = "relations", columnDefinition = "TEXT")
    private List<Relation> relations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Node {
        private String id;

        @NotBlank
        private String label;

        private String type;
        private String description;
        private Map<String, Object> meta;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Relation {
        private String id;

        @NotBlank
        private String from;

        @NotBlank
        private String to;

        @NotBlank
        private String type;

        private Boolean directed = Boolean.TRUE;

        @DecimalMin("0.0")
        @DecimalMax("1.0")
        private Double weight;

        private Map<String, Object> meta;
    }

    // ----- Converters -----

    public static class NodeListConverter implements AttributeConverter<List<Node>, String> {
        private static final ObjectMapper M = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<Node> attribute) {
            try {
                if (attribute == null) return null;
                return M.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert nodes to JSON", e);
            }
        }

        @Override
        public List<Node> convertToEntityAttribute(String dbData) {
            try {
                if (dbData == null || dbData.isBlank()) return null;
                return M.readValue(dbData, new TypeReference<List<Node>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert JSON to nodes", e);
            }
        }
    }

    public static class RelationListConverter implements AttributeConverter<List<Relation>, String> {
        private static final ObjectMapper M = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<Relation> attribute) {
            try {
                if (attribute == null) return null;
                return M.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert relations to JSON", e);
            }
        }

        @Override
        public List<Relation> convertToEntityAttribute(String dbData) {
            try {
                if (dbData == null || dbData.isBlank()) return null;
                return M.readValue(dbData, new TypeReference<List<Relation>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Failed to convert JSON to relations", e);
            }
        }
    }
}
