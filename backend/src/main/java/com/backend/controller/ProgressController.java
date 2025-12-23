package com.backend.controller;

import com.backend.entity.User;
import com.backend.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {
    private final ProgressService progressService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    /**
     * 获取用户的总体学习统计
     */
    @GetMapping("/overall")
    public ResponseEntity<ProgressService.OverallStatsDTO> getOverallStats() {
        User user = currentUser();
        ProgressService.OverallStatsDTO stats = progressService.getOverallStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * 获取用户在所有课程的进度列表
     */
    @GetMapping("/courses")
    public ResponseEntity<List<ProgressService.CourseProgressDTO>> getAllCourseProgress() {
        User user = currentUser();
        List<ProgressService.CourseProgressDTO> progressList = progressService.getAllCourseProgress(user.getId());
        return ResponseEntity.ok(progressList);
    }

    /**
     * 获取用户在某门课程的详细进度
     */
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ProgressService.CourseProgressDTO> getCourseProgress(@PathVariable Long courseId) {
        User user = currentUser();
        ProgressService.CourseProgressDTO progress = progressService.getCourseProgress(user.getId(), courseId);
        return ResponseEntity.ok(progress);
    }
}

