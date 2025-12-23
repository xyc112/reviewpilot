package com.backend.repository;

import com.backend.entity.WrongQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WrongQuestionRepository extends JpaRepository<WrongQuestion, Long> {
    List<WrongQuestion> findByUserIdAndCourseIdAndMasteredOrderByAddedAtDesc(Long userId, Long courseId, Boolean mastered);
    List<WrongQuestion> findByUserIdAndCourseIdOrderByAddedAtDesc(Long userId, Long courseId);
    Optional<WrongQuestion> findByUserIdAndQuestionId(Long userId, Long questionId);
    long countByUserIdAndCourseIdAndMastered(Long userId, Long courseId, Boolean mastered);
    void deleteByUserIdAndQuestionId(Long userId, Long questionId);
}

