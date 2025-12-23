package com.backend.repository;

import com.backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdOrderByOrderIndexAsc(String quizId);
    List<Question> findByCourseId(Long courseId);
    Optional<Question> findByQuizIdAndId(String quizId, Long id);
    void deleteByQuizId(String quizId);
}

