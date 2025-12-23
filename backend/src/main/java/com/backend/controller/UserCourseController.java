package com.backend.controller;

import com.backend.entity.User;
import com.backend.service.UserCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/user-courses")
@RequiredArgsConstructor
public class UserCourseController {
    private final UserCourseService userCourseService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    /**
     * 获取用户选择的所有课程
     */
    @GetMapping
    public ResponseEntity<List<UserCourseService.UserCourseDTO>> getUserCourses() {
        User user = currentUser();
        List<UserCourseService.UserCourseDTO> courses = userCourseService.getUserCourses(user.getId());
        return ResponseEntity.ok(courses);
    }

    /**
     * 添加课程到用户的学习列表
     */
    @PostMapping("/{courseId}")
    public ResponseEntity<Void> addCourse(@PathVariable Long courseId) {
        User user = currentUser();
        userCourseService.addCourseToUser(user.getId(), courseId);
        return ResponseEntity.ok().build();
    }

    /**
     * 从用户的学习列表中移除课程
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> removeCourse(@PathVariable Long courseId) {
        User user = currentUser();
        userCourseService.removeCourseFromUser(user.getId(), courseId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 设置当前学习的课程
     */
    @PutMapping("/{courseId}/current-studying")
    public ResponseEntity<Void> setCurrentStudying(@PathVariable Long courseId) {
        User user = currentUser();
        userCourseService.setCurrentStudyingCourse(user.getId(), courseId);
        return ResponseEntity.ok().build();
    }

    /**
     * 取消当前学习的课程
     */
    @DeleteMapping("/current-studying")
    public ResponseEntity<Void> unsetCurrentStudying() {
        User user = currentUser();
        userCourseService.unsetCurrentStudyingCourse(user.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * 获取当前学习的课程ID
     */
    @GetMapping("/current-studying")
    public ResponseEntity<CurrentStudyingResponse> getCurrentStudying() {
        User user = currentUser();
        java.util.Optional<Long> courseId = userCourseService.getCurrentStudyingCourseId(user.getId());
        CurrentStudyingResponse response = new CurrentStudyingResponse();
        response.setCourseId(courseId.orElse(null));
        return ResponseEntity.ok(response);
    }

    @lombok.Data
    public static class CurrentStudyingResponse {
        private Long courseId;
    }
}

