package com.reviewpilot.controller;

import com.reviewpilot.entity.UserNote;
import com.reviewpilot.entity.UserScore;
import com.reviewpilot.service.UserDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserDataController {

    private final UserDataService userDataService;

    @PostMapping("/scores/batch")
    public ResponseEntity<String> importScoresBatch(@RequestBody List<UserScore> scores) {
        try {
            userDataService.importScoresBatch(scores);
            return ResponseEntity.ok("成绩数据导入成功");
        } catch (Exception e) {
            log.error("导入成绩数据失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body("导入成绩数据失败: " + e.getMessage());
        }
    }

    @GetMapping("/scores")
    public ResponseEntity<List<UserScore>> getUserScores(
            @RequestParam Long courseId,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            List<UserScore> scores = userDataService.getUserScores(userId, courseId);
            return ResponseEntity.ok(scores);
        } catch (Exception e) {
            log.error("获取用户成绩失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/weak-points")
    public ResponseEntity<List<Map<String, Object>>> getWeakPoints(
            @RequestParam Long courseId,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            List<Map<String, Object>> weakPoints = userDataService.getWeakPoints(userId, courseId);
            return ResponseEntity.ok(weakPoints);
        } catch (Exception e) {
            log.error("获取薄弱知识点失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/knowledge-points/{pointId}/user-note")
    public ResponseEntity<UserNote> getUserNote(
            @PathVariable Long pointId,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            UserNote userNote = userDataService.getUserNote(userId, pointId);
            return ResponseEntity.ok(userNote);
        } catch (Exception e) {
            log.error("获取用户笔记失败: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/knowledge-points/{pointId}/user-note")
    public ResponseEntity<UserNote> updateUserNote(
            @PathVariable Long pointId,
            @RequestBody UserNote noteRequest,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            UserNote updatedNote = userDataService.updateUserNote(userId, pointId, noteRequest);
            return ResponseEntity.ok(updatedNote);
        } catch (Exception e) {
            log.error("更新用户笔记失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }
}