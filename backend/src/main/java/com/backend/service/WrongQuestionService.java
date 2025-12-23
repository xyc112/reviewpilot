package com.backend.service;

import com.backend.entity.Question;
import com.backend.entity.User;
import com.backend.entity.WrongQuestion;
import com.backend.repository.QuestionRepository;
import com.backend.repository.WrongQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WrongQuestionService {
    private final WrongQuestionRepository wrongQuestionRepository;
    private final QuestionRepository questionRepository;
    private final CourseService courseService;

    /**
     * 获取用户的错题列表
     */
    public List<WrongQuestion> getWrongQuestions(Long userId, Long courseId, Boolean mastered) {
        courseService.getCourse(courseId); // 验证课程存在
        
        List<WrongQuestion> wrongQuestions;
        if (mastered == null) {
            wrongQuestions = wrongQuestionRepository.findByUserIdAndCourseIdOrderByAddedAtDesc(userId, courseId);
        } else {
            wrongQuestions = wrongQuestionRepository.findByUserIdAndCourseIdAndMasteredOrderByAddedAtDesc(userId, courseId, mastered);
        }
        
        // 加载关联的Question信息
        for (WrongQuestion wq : wrongQuestions) {
            questionRepository.findById(wq.getQuestionId()).ifPresent(wq::setQuestion);
        }
        
        return wrongQuestions;
    }

    /**
     * 添加错题到错题本
     */
    @Transactional
    public WrongQuestion addWrongQuestion(Long userId, Long courseId, Long questionId, List<Integer> userAnswer) {
        // 验证课程存在
        courseService.getCourse(courseId);
        
        // 验证题目存在
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
        
        if (!Objects.equals(question.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question does not belong to this course");
        }

        // 检查是否已存在
        Optional<WrongQuestion> existing = wrongQuestionRepository.findByUserIdAndQuestionId(userId, questionId);
        if (existing.isPresent()) {
            WrongQuestion wq = existing.get();
            // 更新用户答案和练习次数
            wq.setUserAnswer(userAnswer);
            wq.setMastered(false); // 重新添加时重置掌握状态
            wq.setPracticeCount(wq.getPracticeCount() + 1);
            wq.setLastPracticedAt(LocalDateTime.now());
            return wrongQuestionRepository.save(wq);
        }

        // 创建新的错题记录
        WrongQuestion wrongQuestion = WrongQuestion.builder()
                .userId(userId)
                .courseId(courseId)
                .questionId(questionId)
                .quizId(question.getQuizId())
                .userAnswer(userAnswer)
                .mastered(false)
                .practiceCount(1)
                .addedAt(LocalDateTime.now())
                .lastPracticedAt(LocalDateTime.now())
                .build();

        return wrongQuestionRepository.save(wrongQuestion);
    }

    /**
     * 标记错题为已掌握
     */
    @Transactional
    public WrongQuestion markAsMastered(Long userId, Long wrongQuestionId) {
        WrongQuestion wrongQuestion = wrongQuestionRepository.findById(wrongQuestionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wrong question not found"));
        
        if (!Objects.equals(wrongQuestion.getUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your wrong question");
        }

        wrongQuestion.setMastered(true);
        return wrongQuestionRepository.save(wrongQuestion);
    }

    /**
     * 从错题本中移除
     */
    @Transactional
    public void removeWrongQuestion(Long userId, Long wrongQuestionId) {
        WrongQuestion wrongQuestion = wrongQuestionRepository.findById(wrongQuestionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wrong question not found"));
        
        if (!Objects.equals(wrongQuestion.getUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your wrong question");
        }

        wrongQuestionRepository.deleteById(wrongQuestionId);
    }

    /**
     * 增加练习次数
     */
    @Transactional
    public WrongQuestion incrementPracticeCount(Long userId, Long wrongQuestionId) {
        WrongQuestion wrongQuestion = wrongQuestionRepository.findById(wrongQuestionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wrong question not found"));
        
        if (!Objects.equals(wrongQuestion.getUserId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your wrong question");
        }

        wrongQuestion.setPracticeCount(wrongQuestion.getPracticeCount() + 1);
        wrongQuestion.setLastPracticedAt(LocalDateTime.now());
        return wrongQuestionRepository.save(wrongQuestion);
    }

    /**
     * 获取错题统计
     */
    public WrongQuestionStats getStats(Long userId, Long courseId) {
        long total = wrongQuestionRepository.countByUserIdAndCourseIdAndMastered(userId, courseId, null);
        long mastered = wrongQuestionRepository.countByUserIdAndCourseIdAndMastered(userId, courseId, true);
        long notMastered = wrongQuestionRepository.countByUserIdAndCourseIdAndMastered(userId, courseId, false);
        
        return new WrongQuestionStats(total, mastered, notMastered);
    }

    public static class WrongQuestionStats {
        public final long total;
        public final long mastered;
        public final long notMastered;

        public WrongQuestionStats(long total, long mastered, long notMastered) {
            this.total = total;
            this.mastered = mastered;
            this.notMastered = notMastered;
        }
    }
}

