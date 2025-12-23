package com.backend.controller;

import com.backend.entity.ReviewPlan;
import com.backend.entity.User;
import com.backend.service.ReviewPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/review-plans")
@RequiredArgsConstructor
public class ReviewPlanController {
    private final ReviewPlanService reviewPlanService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<ReviewPlan>> list() {
        User user = currentUser();
        return ResponseEntity.ok(reviewPlanService.getUserPlans(user.getId()));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ReviewPlan>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User user = currentUser();
        return ResponseEntity.ok(reviewPlanService.getPlansByDateRange(user.getId(), startDate, endDate));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ReviewPlan>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        User user = currentUser();
        return ResponseEntity.ok(reviewPlanService.getPlansByDate(user.getId(), date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewPlan> get(@PathVariable Long id) {
        User user = currentUser();
        return ResponseEntity.ok(reviewPlanService.getPlan(id, user.getId()));
    }

    @PostMapping
    public ResponseEntity<ReviewPlan> create(@RequestBody ReviewPlan request) {
        User user = currentUser();
        ReviewPlan created = reviewPlanService.createPlan(request, user);
        URI location = URI.create("/api/review-plans/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewPlan> update(@PathVariable Long id, @RequestBody ReviewPlan request) {
        User user = currentUser();
        ReviewPlan updated = reviewPlanService.updatePlan(id, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = currentUser();
        reviewPlanService.deletePlan(id, user);
        return ResponseEntity.noContent().build();
    }
}

