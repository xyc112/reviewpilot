package com.reviewpilot.repository;

import com.reviewpilot.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserUserIdOrderByTimestampDesc(Long userId);

    List<QuizAttempt> findByKnowledgePointPointId(Long pointId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.userId = :userId AND qa.knowledgePoint.pointId = :pointId ORDER BY qa.timestamp DESC")
    List<QuizAttempt> findByUserAndKnowledgePoint(@Param("userId") Long userId,
                                                  @Param("pointId") Long pointId);
}