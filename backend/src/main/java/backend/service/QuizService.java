package backend.service;

import backend.entity.*;
import backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    public List<Question> getRandomQuestions(Long pointId, Integer count) {
        int questionCount = count != null ? count : 5;
        return questionRepository.findRandomQuestionsByPointId(pointId, questionCount);
    }

    public Map<String, Object> submitQuizAttempt(Long userId, Long pointId, Map<String, Object> quizData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在: " + userId));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) quizData.get("answers");

        int totalQuestions = answers.size();
        final int[] correctCount = {0};
        List<Map<String, Object>> details = answers.stream()
                .map(answer -> {
                    Long questionId = Long.valueOf(answer.get("questionId").toString());
                    String selectedAnswer = answer.get("selectedAnswer").toString();

                    Question question = questionRepository.findById(questionId)
                            .orElseThrow(() -> new RuntimeException("题目不存在: " + questionId));

                    boolean isCorrect = question.getCorrectAnswer().equals(selectedAnswer);
                    if (isCorrect) correctCount[0]++;

                    return Map.<String, Object>of(
                            "questionId", questionId,
                            "isCorrect", isCorrect,
                            "correctAnswer", question.getCorrectAnswer(),
                            "selectedAnswer", selectedAnswer
                    );
                })
                .toList();

        double score = totalQuestions > 0 ? (correctCount[0] * 100.0) / totalQuestions : 0;

        // 保存测验记录
        QuizAttempt quizAttempt = new QuizAttempt();
        quizAttempt.setUser(user);
        quizAttempt.setKnowledgePoint(questionRepository.findById(pointId)
                .orElseThrow(() -> new RuntimeException("知识点不存在: " + pointId)).getKnowledgePoint());
        quizAttempt.setScore(score);
        quizAttemptRepository.save(quizAttempt);

        return Map.of(
                "totalScore", score,
                "correctCount", correctCount[0],
                "totalQuestions", totalQuestions,
                "details", details
        );
    }

    public List<QuizAttempt> getQuizHistory(Long userId, Long pointId) {
        if (pointId != null) {
            return quizAttemptRepository.findByUserAndKnowledgePoint(userId, pointId);
        }
        return quizAttemptRepository.findByUserUserIdOrderByTimestampDesc(userId);
    }
}