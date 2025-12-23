package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 用户课程关系实体
 * 记录用户选择的课程和当前学习的课程
 */
@Entity
@Table(name = "user_course",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "course_id"}),
       indexes = {
           @Index(columnList = "user_id"),
           @Index(columnList = "user_id, is_current_studying")
       })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    /**
     * 是否为当前正在学习的课程（一个用户只能有一个当前学习的课程）
     */
    @Column(name = "is_current_studying", nullable = false)
    private Boolean isCurrentStudying;

    /**
     * 添加到学习列表的时间
     */
    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    /**
     * 设置为当前学习课程的时间
     */
    @Column(name = "studying_started_at")
    private LocalDateTime studyingStartedAt;

    @PrePersist
    public void prePersist() {
        if (this.addedAt == null) {
            this.addedAt = LocalDateTime.now();
        }
        if (this.isCurrentStudying == null) {
            this.isCurrentStudying = false;
        }
        if (this.isCurrentStudying && this.studyingStartedAt == null) {
            this.studyingStartedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (this.isCurrentStudying && this.studyingStartedAt == null) {
            this.studyingStartedAt = LocalDateTime.now();
        }
    }
}

