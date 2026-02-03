package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_file")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false, length = 255)
    private String filename;

    /** 如 image/jpeg, application/pdf */
    @Column(name = "content_type", nullable = false, length = 128)
    private String contentType;

    @Lob
    @Column(name = "data", nullable = false)
    private byte[] data;

    /** 上传者用户 id */
    @Column(name = "uploaded_by")
    private Long uploadedBy;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
