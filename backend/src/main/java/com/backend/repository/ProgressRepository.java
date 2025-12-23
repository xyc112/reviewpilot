package com.backend.repository;

import com.backend.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    /**
     * 查找用户在某门课程的所有进度记录（包括测验记录）
     */
    List<Progress> findByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * 查找用户在特定课程和测验的进度记录
     */
    Optional<Progress> findByUserIdAndCourseIdAndQuizId(Long userId, Long courseId, String quizId);

    /**
     * 查找用户在所有课程的所有进度记录
     */
    List<Progress> findByUserId(Long userId);

    /**
     * 查找用户在特定课程已完成的测验记录
     */
    List<Progress> findByUserIdAndCourseIdAndCompletedTrueAndQuizIdIsNotNull(Long userId, Long courseId);

    /**
     * 统计用户在特定课程完成的测验数量
     */
    @Query("SELECT COUNT(p) FROM Progress p WHERE p.userId = :userId AND p.courseId = :courseId AND p.completed = true AND p.quizId IS NOT NULL")
    Long countCompletedQuizzes(@Param("userId") Long userId, @Param("courseId") Long courseId);

    /**
     * 计算用户在特定课程的平均分
     */
    @Query("SELECT AVG(p.score) FROM Progress p WHERE p.userId = :userId AND p.courseId = :courseId AND p.completed = true AND p.quizId IS NOT NULL AND p.score IS NOT NULL")
    Double calculateAverageScore(@Param("userId") Long userId, @Param("courseId") Long courseId);
}

