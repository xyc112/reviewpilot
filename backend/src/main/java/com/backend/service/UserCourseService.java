package com.backend.service;

import com.backend.entity.Course;
import com.backend.entity.UserCourse;
import com.backend.repository.CourseRepository;
import com.backend.repository.UserCourseRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserCourseService {
    private final UserCourseRepository userCourseRepository;
    private final CourseRepository courseRepository;

    /**
     * 添加课程到用户的学习列表
     */
    @Transactional
    public UserCourse addCourseToUser(Long userId, Long courseId) {
        // 验证课程存在
        courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // 检查是否已经添加
        Optional<UserCourse> existing = userCourseRepository.findByUserIdAndCourseId(userId, courseId);
        if (existing.isPresent()) {
            return existing.get();
        }

        UserCourse userCourse = UserCourse.builder()
                .userId(userId)
                .courseId(courseId)
                .isCurrentStudying(false)
                .addedAt(LocalDateTime.now())
                .build();

        return userCourseRepository.save(userCourse);
    }

    /**
     * 从用户的学习列表中移除课程
     */
    @Transactional
    public void removeCourseFromUser(Long userId, Long courseId) {
        UserCourse userCourse = userCourseRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not in user's list"));
        userCourseRepository.delete(userCourse);
    }

    /**
     * 设置当前学习的课程
     */
    @Transactional
    public UserCourse setCurrentStudyingCourse(Long userId, Long courseId) {
        // 先清除所有当前学习标记
        userCourseRepository.clearCurrentStudyingByUserId(userId);

        // 检查课程是否在用户的学习列表中
        UserCourse userCourse = userCourseRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not in user's list"));

        // 设置为当前学习
        userCourse.setIsCurrentStudying(true);
        userCourse.setStudyingStartedAt(LocalDateTime.now());

        return userCourseRepository.save(userCourse);
    }

    /**
     * 取消当前学习的课程
     */
    @Transactional
    public void unsetCurrentStudyingCourse(Long userId) {
        userCourseRepository.clearCurrentStudyingByUserId(userId);
    }

    /**
     * 获取用户选择的所有课程ID列表
     */
    public List<Long> getUserSelectedCourseIds(Long userId) {
        return userCourseRepository.findByUserId(userId).stream()
                .map(UserCourse::getCourseId)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户当前学习的课程ID
     */
    public Optional<Long> getCurrentStudyingCourseId(Long userId) {
        return userCourseRepository.findByUserIdAndIsCurrentStudyingTrue(userId)
                .map(UserCourse::getCourseId);
    }

    /**
     * 获取用户选择的所有课程信息
     */
    public List<UserCourseDTO> getUserCourses(Long userId) {
        return userCourseRepository.findByUserId(userId).stream()
                .map(uc -> {
                    Course course = courseRepository.findById(uc.getCourseId()).orElse(null);
                    UserCourseDTO dto = new UserCourseDTO();
                    dto.setCourseId(uc.getCourseId());
                    dto.setCourseTitle(course != null ? course.getTitle() : null);
                    dto.setIsCurrentStudying(uc.getIsCurrentStudying());
                    dto.setAddedAt(uc.getAddedAt());
                    dto.setStudyingStartedAt(uc.getStudyingStartedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Data
    public static class UserCourseDTO {
        private Long courseId;
        private String courseTitle;
        private Boolean isCurrentStudying;
        private LocalDateTime addedAt;
        private LocalDateTime studyingStartedAt;
    }
}

