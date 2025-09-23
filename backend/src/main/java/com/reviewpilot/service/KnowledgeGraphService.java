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
public class KnowledgeGraphService {

    private final CourseRepository courseRepository;
    private final KnowledgePointRepository knowledgePointRepository;
    private final KnowledgeRelationRepository knowledgeRelationRepository;
    private final UserScoreRepository userScoreRepository;

    public Map<String, Object> getKnowledgeGraphData(Long courseId, Long userId) {
        log.info("获取课程 {} 的知识图谱数据，用户 {}", courseId, userId);

        List<KnowledgePoint> knowledgePoints = knowledgePointRepository.findWithRelationsByCourseId(courseId);

        // 获取用户掌握程度数据
        Map<Long, Double> userMasteryMap = getUserMasteryMap(userId, courseId);

        List<Map<String, Object>> nodes = knowledgePoints.stream()
                .map(kp -> {
                    double masteryScore = userMasteryMap.getOrDefault(kp.getPointId(), 0.0);
                    String masteryLevel = getMasteryLevel(masteryScore);

                    Map<String, Object> node = new HashMap<>();
                    node.put("id", kp.getPointId().toString());
                    node.put("name", kp.getPointName());
                    node.put("type", "knowledgePoint");
                    node.put("description", kp.getDescription());
                    node.put("masteryLevel", masteryLevel);
                    node.put("masteryScore", masteryScore);
                    return node;
                })
                .toList();

        List<Map<String, Object>> edges = knowledgePoints.stream()
                .flatMap(kp -> kp.getOutgoingRelations().stream())
                .map(relation -> {
                    Map<String, Object> edge = new HashMap<>();
                    edge.put("id", relation.getRelationId().toString());
                    edge.put("source", relation.getSourcePoint().getPointId().toString());
                    edge.put("target", relation.getTargetPoint().getPointId().toString());
                    edge.put("type", relation.getRelationType().toString());
                    return edge;
                })
                .toList();

        return Map.of("nodes", nodes, "edges", edges);
    }

    private Map<Long, Double> getUserMasteryMap(Long userId, Long courseId) {
        return userScoreRepository.findByUserUserId(userId).stream()
                .filter(score -> score.getKnowledgePoint().getCourse().getCourseId().equals(courseId))
                .collect(Collectors.groupingBy(
                        score -> score.getKnowledgePoint().getPointId(),
                        Collectors.averagingDouble(UserScore::getScoreValue)
                ));
    }

    private String getMasteryLevel(double score) {
        if (score >= 90) return "strong";
        if (score >= 70) return "medium";
        return "weak";
    }

    public KnowledgePoint createKnowledgePoint(Long courseId, KnowledgePoint knowledgePoint) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("课程不存在: " + courseId));
        knowledgePoint.setCourse(course);
        return knowledgePointRepository.save(knowledgePoint);
    }

    public KnowledgeRelation createKnowledgeRelation(KnowledgeRelation relation) {
        // 验证源知识点和目标知识点是否存在
        KnowledgePoint source = knowledgePointRepository.findById(relation.getSourcePoint().getPointId())
                .orElseThrow(() -> new RuntimeException("源知识点不存在"));
        KnowledgePoint target = knowledgePointRepository.findById(relation.getTargetPoint().getPointId())
                .orElseThrow(() -> new RuntimeException("目标知识点不存在"));

        relation.setSourcePoint(source);
        relation.setTargetPoint(target);

        return knowledgeRelationRepository.save(relation);
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> getCourseById(Long courseId) {
        return courseRepository.findById(courseId);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public void deleteKnowledgePoint(Long pointId) {
        knowledgePointRepository.deleteById(pointId);
    }

    public void deleteKnowledgeRelation(Long relationId) {
        knowledgeRelationRepository.deleteById(relationId);
    }
}