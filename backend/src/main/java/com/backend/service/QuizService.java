package com.backend.service;

import com.backend.entity.Quiz;
import com.backend.entity.User;
import com.backend.repository.QuizRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final CourseService courseService;

    private void ensureCourseExists(Long courseId) {
        courseService.getCourse(courseId);
    }

    // 列表：对非作者/非 ADMIN 隐藏答案
    public List<Quiz> listQuizzes(Long courseId, User currentUser) {
        ensureCourseExists(courseId);
        List<Quiz> all = quizRepository.findByCourseId(courseId);
        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        return all.stream()
                .map(q -> maskAnswersIfNeeded(q, currentUser, isAdmin))
                .collect(Collectors.toList());
    }

    public Quiz getQuiz(Long courseId, String quizId, User currentUser) {
        ensureCourseExists(courseId);
        Quiz quiz = quizRepository.findByCourseIdAndId(courseId, quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        return maskAnswersIfNeeded(quiz, currentUser, isAdmin);
    }

    private Quiz maskAnswersIfNeeded(Quiz quiz, User currentUser, boolean isAdmin) {
        boolean isOwner = currentUser != null && Objects.equals(quiz.getAuthorId(), currentUser.getId());
        if (isAdmin || isOwner) return quiz;
        // deep copy with answers nulled
        List<Quiz.Question> masked = Optional.ofNullable(quiz.getQuestions()).orElse(List.of()).stream()
                .map(q -> Quiz.Question.builder()
                        .id(q.getId())
                        .type(q.getType())
                        .question(q.getQuestion())
                        .options(q.getOptions())
                        .answer(null)
                        .build())
                .collect(Collectors.toList());
        return Quiz.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourseId())
                .title(quiz.getTitle())
                .questions(masked)
                .authorId(quiz.getAuthorId())
                .createdAt(quiz.getCreatedAt())
                .updatedAt(quiz.getUpdatedAt())
                .build();
    }

    public Quiz createQuiz(Long courseId, Quiz request, User currentUser) {
        ensureCourseExists(courseId);
        if (request.getTitle() == null || request.getTitle().isBlank()
                || request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title and questions are required");
        }

        // generate quiz id q{n}
        List<Quiz> existing = quizRepository.findByCourseId(courseId);
        int max = existing.stream()
                .map(Quiz::getId)
                .filter(Objects::nonNull)
                .filter(id -> id.startsWith("q"))
                .map(id -> {
                    try { return Integer.parseInt(id.substring(1)); } catch (Exception e) { return 0; }
                })
                .max(Comparator.naturalOrder())
                .orElse(0);
        String id = "q" + (max + 1);

        // assign question ids
        AtomicInteger idx = new AtomicInteger(1);
        List<Quiz.Question> qs = request.getQuestions().stream()
                .map(q -> {
                    Quiz.Question nq = Quiz.Question.builder()
                            .id(id + "-" + idx.getAndIncrement())
                            .type(q.getType())
                            .question(q.getQuestion())
                            .options(q.getOptions())
                            .answer(q.getAnswer())
                            .build();
                    return nq;
                })
                .collect(Collectors.toList());

        Quiz quiz = Quiz.builder()
                .id(id)
                .courseId(courseId)
                .title(request.getTitle())
                .questions(qs)
                .authorId(currentUser.getId())
                .createdAt(LocalDateTime.now())
                .build();

        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(Long courseId, String quizId, Quiz request, User currentUser) {
        ensureCourseExists(courseId);
        Quiz existing = quizRepository.findByCourseIdAndId(courseId, quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));

        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        boolean isOwner = currentUser != null && Objects.equals(existing.getAuthorId(), currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not quiz owner or admin");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) existing.setTitle(request.getTitle());

        if (request.getQuestions() != null) {
            AtomicInteger idx = new AtomicInteger(1);
            List<Quiz.Question> qs = request.getQuestions().stream()
                    .map(q -> Quiz.Question.builder()
                            .id(quizId + "-" + idx.getAndIncrement())
                            .type(q.getType())
                            .question(q.getQuestion())
                            .options(q.getOptions())
                            .answer(q.getAnswer())
                            .build())
                    .collect(Collectors.toList());
            existing.setQuestions(qs);
        }

        return quizRepository.save(existing);
    }

    public void deleteQuiz(Long courseId, String quizId, User currentUser) {
        ensureCourseExists(courseId);
        Quiz existing = quizRepository.findByCourseIdAndId(courseId, quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));

        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        boolean isOwner = currentUser != null && Objects.equals(existing.getAuthorId(), currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not quiz owner or admin");
        }

        quizRepository.deleteById(existing.getId());
    }

    // Attempts: simple auto grading
    public Map<String, Object> submitAttempt(Long courseId, String quizId, AttemptRequest request, User currentUser) {
        ensureCourseExists(courseId);
        Quiz quiz = quizRepository.findByCourseIdAndId(courseId, quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));

        if (request == null || request.getAnswers() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "answers format invalid");
        }

        Map<String, Quiz.Question> qmap = Optional.ofNullable(quiz.getQuestions()).orElse(List.of())
                .stream().collect(Collectors.toMap(Quiz.Question::getId, q -> q));

        int totalQuestions = qmap.size();
        if (totalQuestions == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz has no questions");
        }

        int totalScore = 0;
        int maxScore = 100;
        int perQuestion = maxScore / totalQuestions;

        List<Map<String, Object>> results = new ArrayList<>();

        for (AttemptRequest.Answer a : request.getAnswers()) {
            Quiz.Question q = qmap.get(a.getQuestionId());
            Map<String, Object> r = new HashMap<>();
            r.put("questionId", a.getQuestionId());
            if (q == null) {
                r.put("correct", false);
                r.put("score", 0);
                results.add(r);
                continue;
            }
            boolean correct = false;
            if ("single".equalsIgnoreCase(q.getType()) || "multiple".equalsIgnoreCase(q.getType())) {
                List<Integer> correctAnswer = q.getAnswer() == null ? List.of() : q.getAnswer();
                List<Integer> provided = a.getAnswer() == null ? List.of() : a.getAnswer();
                // require exact match (order-insensitive)
                Set<Integer> ca = new HashSet<>(correctAnswer);
                Set<Integer> pa = new HashSet<>(provided);
                correct = ca.equals(pa);
                int score = correct ? perQuestion : 0;
                totalScore += score;
                r.put("correct", correct);
                r.put("score", score);
            } else {
                // short answer: not auto-graded
                r.put("correct", false);
                r.put("score", 0);
            }
            results.add(r);
        }

        // ensure total is at most maxScore (due to integer division)
        int computed = Math.min(totalScore, maxScore);

        Map<String, Object> resp = new HashMap<>();
        resp.put("quizId", quizId);
        resp.put("userId", currentUser.getId());
        resp.put("score", computed);
        resp.put("total", maxScore);
        resp.put("results", results);
        resp.put("submittedAt", java.time.LocalDateTime.now());
        return resp;
    }

    // DTO for attempts
    @Data
    public static class AttemptRequest {
        private List<Answer> answers;

        @Data
        public static class Answer {
            private String questionId;
            private List<Integer> answer;
        }
    }
}
