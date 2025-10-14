package backend.controller;

import backend.entity.Question;
import backend.entity.QuizAttempt;
import backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/questions/random")
    public ResponseEntity<List<Question>> getRandomQuestions(
            @RequestParam Long pointId,
            @RequestParam(defaultValue = "5") Integer count,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            List<Question> questions = quizService.getRandomQuestions(pointId, count);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("获取随机题目失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/attempt")
    public ResponseEntity<Map<String, Object>> submitQuizAttempt(
            @RequestBody Map<String, Object> quizData,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            Long pointId = Long.valueOf(quizData.get("pointId").toString());
            Map<String, Object> result = quizService.submitQuizAttempt(userId, pointId, quizData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("提交测验失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/attempts/history")
    public ResponseEntity<List<QuizAttempt>> getQuizHistory(
            @RequestParam(required = false) Long pointId,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            List<QuizAttempt> history = quizService.getQuizHistory(userId, pointId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("获取测验历史失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}