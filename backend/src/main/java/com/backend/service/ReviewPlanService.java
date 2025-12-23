package com.backend.service;

import com.backend.entity.ReviewPlan;
import com.backend.entity.User;
import com.backend.repository.ReviewPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewPlanService {
    private final ReviewPlanRepository reviewPlanRepository;

    public List<ReviewPlan> getUserPlans(Long userId) {
        return reviewPlanRepository.findByUserIdOrderByPlanDateAsc(userId);
    }

    public List<ReviewPlan> getPlansByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return reviewPlanRepository.findByUserIdAndPlanDateBetween(userId, startDate, endDate);
    }

    public List<ReviewPlan> getPlansByDate(Long userId, LocalDate date) {
        return reviewPlanRepository.findByUserIdAndPlanDate(userId, date);
    }

    public ReviewPlan getPlan(Long id, Long userId) {
        return reviewPlanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review plan not found"));
    }

    public ReviewPlan createPlan(ReviewPlan request, User currentUser) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (request.getPlanDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planDate is required");
        }
        if (request.getType() == null || (!request.getType().equals("plan") && !request.getType().equals("exam"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type must be 'plan' or 'exam'");
        }

        ReviewPlan plan = ReviewPlan.builder()
                .userId(currentUser.getId())
                .planDate(request.getPlanDate())
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .completed(request.getCompleted() != null ? request.getCompleted() : false)
                .build();

        return reviewPlanRepository.save(plan);
    }

    public ReviewPlan updatePlan(Long id, ReviewPlan request, User currentUser) {
        ReviewPlan existing = reviewPlanRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review plan not found"));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            existing.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getPlanDate() != null) {
            existing.setPlanDate(request.getPlanDate());
        }
        if (request.getType() != null && (request.getType().equals("plan") || request.getType().equals("exam"))) {
            existing.setType(request.getType());
        }
        if (request.getCompleted() != null) {
            existing.setCompleted(request.getCompleted());
        }

        return reviewPlanRepository.save(existing);
    }

    public void deletePlan(Long id, User currentUser) {
        ReviewPlan existing = reviewPlanRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review plan not found"));
        reviewPlanRepository.deleteById(existing.getId());
    }
}

