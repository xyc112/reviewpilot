package com.reviewpilot.repository;

import com.reviewpilot.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.knowledgePoints WHERE c.courseId = :courseId")
    Optional<Course> findCourseWithKnowledgePoints(@Param("courseId") Long courseId);

    Optional<Course> findByCourseName(String courseName);
}