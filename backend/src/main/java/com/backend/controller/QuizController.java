package com.backend.controller;

import com.backend.entity.Quiz;
import com.backend.entity.User;
import com.backend.service.CourseService;
import com.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/courses/{courseId}/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;
    private final CourseService courseService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    private boolean isWriter(Long courseId, User user) {
        var course = courseService.getCourse(courseId); // 若不存在会抛 404
        return user.getRole() == User.Role.ADMIN || Objects.equals(course.getAuthorId(), user.getId());
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> list(@PathVariable Long courseId) {
        User user = currentUser();
        return ResponseEntity.ok(quizService.listQuizzes(courseId, user));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> get(@PathVariable Long courseId, @PathVariable String quizId) {
        User user = currentUser();
        return ResponseEntity.ok(quizService.getQuiz(courseId, quizId, user));
    }

    @PostMapping
    public ResponseEntity<Quiz> create(@PathVariable Long courseId, @RequestBody Quiz request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");
        Quiz created = quizService.createQuiz(courseId, request, user);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/quizzes/" + created.getId())).body(created);
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> update(@PathVariable Long courseId, @PathVariable String quizId, @RequestBody Quiz request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");
        Quiz updated = quizService.updateQuiz(courseId, quizId, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId, @PathVariable String quizId) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");
        quizService.deleteQuiz(courseId, quizId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/attempts")
    public ResponseEntity<Map<String, Object>> submitAttempt(
            @PathVariable Long courseId,
            @PathVariable String quizId,
            @RequestBody QuizService.AttemptRequest request
    ) {
        User user = currentUser();
        Map<String, Object> result = quizService.submitAttempt(courseId, quizId, request, user);
        return ResponseEntity.ok(result);
    }
}
