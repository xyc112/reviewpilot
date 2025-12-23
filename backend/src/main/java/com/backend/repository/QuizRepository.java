package com.backend.repository;

import com.backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, String> {
    List<Quiz> findByCourseId(Long courseId);
    Optional<Quiz> findByCourseIdAndId(Long courseId, String id);
    boolean existsByCourseIdAndId(Long courseId, String id);
    long countByCourseId(Long courseId);
}
