package com.reviewpilot.service;

import com.reviewpilot.entity.*;
import com.reviewpilot.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserDataService {

    private final UserScoreRepository userScoreRepository;
    private final UserNoteRepository userNoteRepository;
    private final UserRepository userRepository;
    private final KnowledgePointRepository knowledgePointRepository;

    public void importScoresBatch(List<UserScore> scores) {
        log.info("批量导入 {} 条成绩数据", scores.size());
        userScoreRepository.saveAll(scores);
    }

    public List<Map<String, Object>> getWeakPoints(Long userId, Long courseId) {
        // 简化实现：根据平均分判断掌握程度
        return userScoreRepository.findByUserUserId(userId).stream()
                .filter(score -> score.getKnowledgePoint().getCourse().getCourseId().equals(courseId))
                .collect(Collectors.groupingBy(UserScore::getKnowledgePoint))
                .entrySet().stream()
                .map(entry -> {
                    KnowledgePoint point = entry.getKey();
                    List<UserScore> scores = entry.getValue();
                    double averageScore = scores.stream()
                            .mapToDouble(UserScore::getScoreValue)
                            .average()
                            .orElse(0.0);

                    String masteryLevel = getMasteryLevel(averageScore);

                    return Map.<String, Object>of(
                            "pointId", point.getPointId(),
                            "pointName", point.getPointName(),
                            "masteryLevel", masteryLevel,
                            "averageScore", averageScore
                    );
                })
                .collect(Collectors.toList());
    }

    private String getMasteryLevel(double averageScore) {
        if (averageScore >= 90) return "strong";
        if (averageScore >= 70) return "medium";
        return "weak";
    }

    public UserNote getUserNote(Long userId, Long pointId) {
        return userNoteRepository.findByUserAndKnowledgePoint(userId, pointId)
                .orElseGet(() -> {
                    UserNote newNote = new UserNote();
                    // 设置基础信息
                    userRepository.findById(userId).ifPresent(newNote::setUser);
                    knowledgePointRepository.findById(pointId).ifPresent(newNote::setKnowledgePoint);
                    return newNote;
                });
    }

    public UserNote updateUserNote(Long userId, Long pointId, UserNote noteRequest) {
        Optional<UserNote> existingNote = userNoteRepository.findByUserAndKnowledgePoint(userId, pointId);

        UserNote userNote = existingNote.orElseGet(() -> {
            UserNote newNote = new UserNote();
            // 设置用户和知识点关系
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在: " + userId));
            KnowledgePoint knowledgePoint = knowledgePointRepository.findById(pointId)
                    .orElseThrow(() -> new RuntimeException("知识点不存在: " + pointId));
            newNote.setUser(user);
            newNote.setKnowledgePoint(knowledgePoint);
            return newNote;
        });

        userNote.setContent(noteRequest.getContent());
        userNote.setAttachments(noteRequest.getAttachments());

        return userNoteRepository.save(userNote);
    }

    public List<UserScore> getUserScores(Long userId, Long courseId) {
        return userScoreRepository.findByUserUserId(userId).stream()
                .filter(score -> score.getKnowledgePoint().getCourse().getCourseId().equals(courseId))
                .collect(Collectors.toList());
    }
}