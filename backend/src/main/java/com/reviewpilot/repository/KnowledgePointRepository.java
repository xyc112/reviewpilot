package com.reviewpilot.repository;

import com.reviewpilot.entity.KnowledgePoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgePointRepository extends JpaRepository<KnowledgePoint, Long> {

    List<KnowledgePoint> findByCourseCourseId(Long courseId);

    @Query("SELECT kp FROM KnowledgePoint kp LEFT JOIN FETCH kp.outgoingRelations WHERE kp.course.courseId = :courseId")
    List<KnowledgePoint> findWithRelationsByCourseId(@Param("courseId") Long courseId);

    Optional<KnowledgePoint> findByPointNameAndCourseCourseId(String pointName, Long courseId);
}