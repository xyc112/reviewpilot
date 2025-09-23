package com.reviewpilot.controller;

import com.reviewpilot.entity.Course;
import com.reviewpilot.entity.KnowledgePoint;
import com.reviewpilot.entity.KnowledgeRelation;
import com.reviewpilot.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class KnowledgeGraphController {

    private final KnowledgeGraphService knowledgeGraphService;

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        try {
            List<Course> courses = knowledgeGraphService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            log.error("获取课程列表失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long courseId) {
        try {
            Course course = knowledgeGraphService.getCourseById(courseId)
                    .orElseThrow(() -> new RuntimeException("课程不存在: " + courseId));
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            log.error("获取课程失败: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        try {
            Course createdCourse = knowledgeGraphService.createCourse(course);
            return ResponseEntity.ok(createdCourse);
        } catch (Exception e) {
            log.error("创建课程失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/courses/{courseId}/knowledge-graph")
    public ResponseEntity<Map<String, Object>> getKnowledgeGraph(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            Map<String, Object> graphData = knowledgeGraphService.getKnowledgeGraphData(courseId, userId);
            return ResponseEntity.ok(graphData);
        } catch (Exception e) {
            log.error("获取知识图谱失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/knowledge-points")
    public ResponseEntity<KnowledgePoint> createKnowledgePoint(
            @PathVariable Long courseId,
            @RequestBody KnowledgePoint knowledgePoint) {
        try {
            KnowledgePoint createdPoint = knowledgeGraphService.createKnowledgePoint(courseId, knowledgePoint);
            return ResponseEntity.ok(createdPoint);
        } catch (Exception e) {
            log.error("创建知识点失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/knowledge-points/{pointId}")
    public ResponseEntity<String> deleteKnowledgePoint(@PathVariable Long pointId) {
        try {
            knowledgeGraphService.deleteKnowledgePoint(pointId);
            return ResponseEntity.ok("知识点删除成功");
        } catch (Exception e) {
            log.error("删除知识点失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body("删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/knowledge-relations")
    public ResponseEntity<KnowledgeRelation> createKnowledgeRelation(
            @RequestBody KnowledgeRelation relation) {
        try {
            KnowledgeRelation createdRelation = knowledgeGraphService.createKnowledgeRelation(relation);
            return ResponseEntity.ok(createdRelation);
        } catch (Exception e) {
            log.error("创建知识点关系失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/knowledge-relations/{relationId}")
    public ResponseEntity<String> deleteKnowledgeRelation(@PathVariable Long relationId) {
        try {
            knowledgeGraphService.deleteKnowledgeRelation(relationId);
            return ResponseEntity.ok("知识点关系删除成功");
        } catch (Exception e) {
            log.error("删除知识点关系失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body("删除失败: " + e.getMessage());
        }
    }
}