package com.backend.controller;

import com.backend.entity.User;
import com.backend.entity.WrongQuestion;
import com.backend.service.WrongQuestionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses/{courseId}/wrong-questions")
@RequiredArgsConstructor
public class WrongQuestionController {
    private final WrongQuestionService wrongQuestionService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<WrongQuestion>> list(
            @PathVariable Long courseId,
            @RequestParam(required = false) Boolean mastered
    ) {
        User user = currentUser();
        List<WrongQuestion> wrongQuestions = wrongQuestionService.getWrongQuestions(user.getId(), courseId, mastered);
        return ResponseEntity.ok(wrongQuestions);
    }

    @PostMapping
    public ResponseEntity<WrongQuestion> add(
            @PathVariable Long courseId,
            @RequestBody AddWrongQuestionRequest request
    ) {
        User user = currentUser();
        WrongQuestion wrongQuestion = wrongQuestionService.addWrongQuestion(
                user.getId(),
                courseId,
                request.getQuestionId(),
                request.getUserAnswer()
        );
        return ResponseEntity.ok(wrongQuestion);
    }

    @PutMapping("/{wrongQuestionId}/mastered")
    public ResponseEntity<WrongQuestion> markAsMastered(
            @PathVariable Long courseId,
            @PathVariable Long wrongQuestionId
    ) {
        User user = currentUser();
        WrongQuestion wrongQuestion = wrongQuestionService.markAsMastered(user.getId(), wrongQuestionId);
        return ResponseEntity.ok(wrongQuestion);
    }

    @DeleteMapping("/{wrongQuestionId}")
    public ResponseEntity<Void> remove(
            @PathVariable Long courseId,
            @PathVariable Long wrongQuestionId
    ) {
        User user = currentUser();
        wrongQuestionService.removeWrongQuestion(user.getId(), wrongQuestionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{wrongQuestionId}/practice")
    public ResponseEntity<WrongQuestion> practice(
            @PathVariable Long courseId,
            @PathVariable Long wrongQuestionId
    ) {
        User user = currentUser();
        WrongQuestion wrongQuestion = wrongQuestionService.incrementPracticeCount(user.getId(), wrongQuestionId);
        return ResponseEntity.ok(wrongQuestion);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable Long courseId) {
        User user = currentUser();
        WrongQuestionService.WrongQuestionStats stats = wrongQuestionService.getStats(user.getId(), courseId);
        return ResponseEntity.ok(Map.of(
                "total", stats.total,
                "mastered", stats.mastered,
                "notMastered", stats.notMastered
        ));
    }

    @Data
    public static class AddWrongQuestionRequest {
        private Long questionId;
        private List<Integer> userAnswer;
    }
}

