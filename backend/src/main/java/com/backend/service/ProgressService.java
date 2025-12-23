package com.backend.service;

import com.backend.entity.Progress;
import com.backend.repository.NoteRepository;
import com.backend.repository.ProgressRepository;
import com.backend.repository.QuizRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;
    private final QuizRepository quizRepository;
    private final NoteRepository noteRepository;
    private final CourseService courseService;

    /**
     * 保存或更新测验进度
     */
    @Transactional
    public Progress saveQuizProgress(Long userId, Long courseId, String quizId, Integer score, Integer totalScore) {
        // 验证课程存在
        courseService.getCourse(courseId);

        Optional<Progress> existing = progressRepository.findByUserIdAndCourseIdAndQuizId(userId, courseId, quizId);
        
        Progress progress;
        if (existing.isPresent()) {
            progress = existing.get();
            // 只更新更高分的记录
            if (score != null && (progress.getScore() == null || score > progress.getScore())) {
                progress.setScore(score);
                progress.setTotalScore(totalScore);
                progress.setCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
            }
        } else {
            progress = Progress.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .quizId(quizId)
                    .score(score)
                    .totalScore(totalScore)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .lastAccessedAt(LocalDateTime.now())
                    .build();
        }

        return progressRepository.save(progress);
    }

    /**
     * 获取用户的总体学习统计
     */
    public OverallStatsDTO getOverallStats(Long userId) {
        List<Progress> allProgress = progressRepository.findByUserId(userId);
        
        // 获取所有课程ID
        Set<Long> courseIds = allProgress.stream()
                .map(Progress::getCourseId)
                .collect(Collectors.toSet());

        // 统计各课程的测验数量
        Map<Long, Long> quizCountsByCourse = new HashMap<>();
        for (Long courseId : courseIds) {
            long count = quizRepository.countByCourseId(courseId);
            quizCountsByCourse.put(courseId, count);
        }

        // 统计已完成的测验
        List<Progress> completedQuizzes = allProgress.stream()
                .filter(p -> p.getCompleted() && p.getQuizId() != null)
                .collect(Collectors.toList());

        // 统计笔记数量
        Map<Long, Long> noteCountsByCourse = new HashMap<>();
        for (Long courseId : courseIds) {
            long count = noteRepository.countByCourseIdAndAuthorId(courseId, userId);
            noteCountsByCourse.put(courseId, count);
        }

        // 计算总测验数和已完成测验数
        long totalQuizzes = quizCountsByCourse.values().stream().mapToLong(Long::longValue).sum();
        long completedQuizCount = completedQuizzes.size();

        // 计算平均分
        OptionalDouble avgScore = completedQuizzes.stream()
                .filter(p -> p.getScore() != null)
                .mapToInt(Progress::getScore)
                .average();

        // 计算总笔记数
        long totalNotes = noteCountsByCourse.values().stream().mapToLong(Long::longValue).sum();

        OverallStatsDTO stats = new OverallStatsDTO();
        stats.setTotalCourses(courseIds.size());
        stats.setTotalQuizzes(totalQuizzes);
        stats.setCompletedQuizzes(completedQuizCount);
        stats.setAverageScore(avgScore.isPresent() ? (int) Math.round(avgScore.getAsDouble()) : null);
        stats.setTotalNotes(totalNotes);
        stats.setCompletionRate(totalQuizzes > 0 ? (int) Math.round((completedQuizCount * 100.0 / totalQuizzes)) : 0);

        return stats;
    }

    /**
     * 获取用户在某门课程的详细进度
     */
    public CourseProgressDTO getCourseProgress(Long userId, Long courseId) {
        // 验证课程存在
        courseService.getCourse(courseId);

        List<Progress> progressList = progressRepository.findByUserIdAndCourseId(userId, courseId);
        
        // 获取该课程的所有测验
        long totalQuizzes = quizRepository.countByCourseId(courseId);
        
        // 统计已完成的测验
        List<Progress> completedQuizzes = progressList.stream()
                .filter(p -> p.getCompleted() && p.getQuizId() != null)
                .collect(Collectors.toList());

        // 计算平均分
        OptionalDouble avgScore = completedQuizzes.stream()
                .filter(p -> p.getScore() != null)
                .mapToInt(Progress::getScore)
                .average();

        // 统计笔记数量
        long noteCount = noteRepository.countByCourseIdAndAuthorId(courseId, userId);

        // 获取每个测验的进度详情
        List<QuizProgressDTO> quizProgressList = completedQuizzes.stream()
                .map(p -> {
                    QuizProgressDTO dto = new QuizProgressDTO();
                    dto.setQuizId(p.getQuizId());
                    dto.setScore(p.getScore());
                    dto.setTotalScore(p.getTotalScore());
                    dto.setCompletedAt(p.getCompletedAt());
                    return dto;
                })
                .sorted(Comparator.comparing(QuizProgressDTO::getCompletedAt).reversed())
                .collect(Collectors.toList());

        CourseProgressDTO courseProgress = new CourseProgressDTO();
        courseProgress.setCourseId(courseId);
        courseProgress.setTotalQuizzes(totalQuizzes);
        courseProgress.setCompletedQuizzes(completedQuizzes.size());
        courseProgress.setAverageScore(avgScore.isPresent() ? (int) Math.round(avgScore.getAsDouble()) : null);
        courseProgress.setNoteCount(noteCount);
        courseProgress.setQuizProgressList(quizProgressList);
        courseProgress.setCompletionRate(totalQuizzes > 0 ? (int) Math.round((completedQuizzes.size() * 100.0 / totalQuizzes)) : 0);

        return courseProgress;
    }

    /**
     * 获取用户在所有课程的进度列表
     */
    public List<CourseProgressDTO> getAllCourseProgress(Long userId) {
        List<Progress> allProgress = progressRepository.findByUserId(userId);
        
        // 获取所有课程ID
        Set<Long> courseIds = allProgress.stream()
                .map(Progress::getCourseId)
                .collect(Collectors.toSet());

        return courseIds.stream()
                .map(courseId -> getCourseProgress(userId, courseId))
                .collect(Collectors.toList());
    }

    // DTOs
    @Data
    public static class OverallStatsDTO {
        private int totalCourses;
        private long totalQuizzes;
        private long completedQuizzes;
        private Integer averageScore;
        private long totalNotes;
        private int completionRate; // 百分比
    }

    @Data
    public static class CourseProgressDTO {
        private Long courseId;
        private long totalQuizzes;
        private long completedQuizzes;
        private Integer averageScore;
        private long noteCount;
        private int completionRate; // 百分比
        private List<QuizProgressDTO> quizProgressList;
    }

    @Data
    public static class QuizProgressDTO {
        private String quizId;
        private Integer score;
        private Integer totalScore;
        private LocalDateTime completedAt;
    }
}

