package com.backend.repository;

import com.backend.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {
    /**
     * 查找用户选择的所有课程
     */
    List<UserCourse> findByUserId(Long userId);

    /**
     * 查找用户当前正在学习的课程
     */
    Optional<UserCourse> findByUserIdAndIsCurrentStudyingTrue(Long userId);

    /**
     * 查找用户选择的特定课程
     */
    Optional<UserCourse> findByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * 检查用户是否选择了某个课程
     */
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    /**
     * 清除用户的所有当前学习课程标记
     */
    @Modifying
    @Query("UPDATE UserCourse uc SET uc.isCurrentStudying = false, uc.studyingStartedAt = null WHERE uc.userId = :userId")
    void clearCurrentStudyingByUserId(@Param("userId") Long userId);
}

