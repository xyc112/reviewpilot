package com.backend.service;

import com.backend.entity.Question;
import com.backend.entity.Quiz;
import com.backend.entity.User;
import com.backend.repository.QuestionRepository;
import com.backend.repository.QuizRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final CourseService courseService;
    private final ProgressService progressService;

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

        Quiz savedQuiz = quizRepository.save(quiz);

        // 同步创建Question实体
        syncQuestionsToEntity(courseId, id, qs);

        return savedQuiz;
    }

    /**
     * 将Quiz中的questions同步到Question实体
     */
    @Transactional
    private void syncQuestionsToEntity(Long courseId, String quizId, List<Quiz.Question> questions) {
        // 删除旧的Question实体
        questionRepository.deleteByQuizId(quizId);

        // 创建新的Question实体
        for (int i = 0; i < questions.size(); i++) {
            Quiz.Question q = questions.get(i);
            Question question = Question.builder()
                    .quizId(quizId)
                    .courseId(courseId)
                    .originalId(q.getId()) // 保存原始ID
                    .type(q.getType())
                    .question(q.getQuestion())
                    .options(q.getOptions())
                    .answer(q.getAnswer())
                    .orderIndex(i)
                    .build();
            questionRepository.save(question);
        }
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

            // 同步更新Question实体
            syncQuestionsToEntity(courseId, quizId, qs);
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

        // 获取Question实体，建立字符串ID到Long ID的映射
        List<Question> questionEntities = questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);

        // 如果Question实体不存在，自动创建它们（兼容旧数据）
        if (questionEntities.isEmpty() && quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            syncQuestionsToEntity(courseId, quizId, quiz.getQuestions());
            questionEntities = questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId);
        }

        Map<String, Long> questionIdMap = questionEntities.stream()
                .filter(q -> q.getOriginalId() != null)
                .collect(Collectors.toMap(
                        Question::getOriginalId, // 使用原始ID
                        Question::getId,
                        (existing, replacement) -> existing
                ));

        Map<String, Quiz.Question> qmap = Optional.ofNullable(quiz.getQuestions()).orElse(List.of())
                .stream().collect(Collectors.toMap(Quiz.Question::getId, q -> q));

        int totalQuestions = qmap.size();
        if (totalQuestions == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz has no questions");
        }

        int maxScore = 100;
        // 计算每道题的基础分数和余数，确保总分正好是100
        int baseScore = maxScore / totalQuestions;
        int remainder = maxScore % totalQuestions;

        // 为每道题分配分数：前remainder道题多1分，确保总分正好是100
        // 按照题目在列表中的顺序分配分数
        List<Quiz.Question> questionList = Optional.ofNullable(quiz.getQuestions()).orElse(List.of());
        Map<String, Integer> questionScoreMap = new HashMap<>();
        for (int i = 0; i < questionList.size(); i++) {
            Quiz.Question q = questionList.get(i);
            int score = baseScore + (i < remainder ? 1 : 0);
            questionScoreMap.put(q.getId(), score);
        }

        int totalScore = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        // 处理用户提交的答案
        for (AttemptRequest.Answer a : request.getAnswers()) {
            Quiz.Question q = qmap.get(a.getQuestionId());
            Map<String, Object> r = new HashMap<>();
            r.put("questionId", a.getQuestionId());
            // 添加Question实体的ID，用于错题本
            Long questionEntityId = questionIdMap.get(a.getQuestionId());
            if (questionEntityId != null) {
                r.put("questionEntityId", questionEntityId);
            }
            if (q == null) {
                r.put("correct", false);
                r.put("score", 0);
                results.add(r);
                continue;
            }

            boolean correct = false;
            int questionScore = questionScoreMap.getOrDefault(a.getQuestionId(), baseScore);

            if ("single".equalsIgnoreCase(q.getType()) || "multiple".equalsIgnoreCase(q.getType()) || "truefalse".equalsIgnoreCase(q.getType())) {
                List<Integer> correctAnswer = q.getAnswer() == null ? List.of() : q.getAnswer();
                List<Integer> provided = a.getAnswer() == null ? List.of() : a.getAnswer();
                // require exact match (order-insensitive)
                Set<Integer> ca = new HashSet<>(correctAnswer);
                Set<Integer> pa = new HashSet<>(provided);
                correct = ca.equals(pa);
                int score = correct ? questionScore : 0;
                totalScore += score;
                r.put("correct", correct);
                r.put("score", score);
            } else {
                // unknown type: not auto-graded
                r.put("correct", false);
                r.put("score", 0);
            }
            results.add(r);
        }

        // 处理用户未回答的题目
        for (Quiz.Question q : questionList) {
            boolean alreadyProcessed = results.stream()
                    .anyMatch(r -> q.getId().equals(r.get("questionId")));
            if (!alreadyProcessed) {
                Map<String, Object> r = new HashMap<>();
                r.put("questionId", q.getId());
                // 添加Question实体的ID
                Long questionEntityId = questionIdMap.get(q.getId());
                if (questionEntityId != null) {
                    r.put("questionEntityId", questionEntityId);
                }
                r.put("correct", false);
                r.put("score", 0);
                results.add(r);
            }
        }

        // 确保总分不超过maxScore（理论上应该正好等于maxScore）
        int computed = Math.min(totalScore, maxScore);

        // 保存进度记录
        progressService.saveQuizProgress(currentUser.getId(), courseId, quizId, computed, maxScore);

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
