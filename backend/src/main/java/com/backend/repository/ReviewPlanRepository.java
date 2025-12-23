package com.backend.repository;

import com.backend.entity.ReviewPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewPlanRepository extends JpaRepository<ReviewPlan, Long> {
    List<ReviewPlan> findByUserIdOrderByPlanDateAsc(Long userId);
    List<ReviewPlan> findByUserIdAndPlanDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<ReviewPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
    Optional<ReviewPlan> findByIdAndUserId(Long id, Long userId);
}

