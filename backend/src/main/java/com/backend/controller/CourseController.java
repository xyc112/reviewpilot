package com.backend.controller;

import com.backend.entity.Course;
import com.backend.entity.User;
import com.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<Course>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String level
    ) {
        List<String> tagList = (tags == null || tags.isBlank()) ?
                List.of() :
                Arrays.stream(tags.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());

        Course.Level levelEnum = null;
        if (level != null && !level.isBlank()) {
            try {
                levelEnum = Course.Level.valueOf(level.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid level: " + level);
            }
        }

        List<Course> courses = courseService.listCourses(q, tagList, levelEnum);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> get(@PathVariable Long id) {
        Course course = courseService.getCourse(id);
        if (course == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        return ResponseEntity.ok(course);
    }

    @PostMapping
    public ResponseEntity<Course> create(@RequestBody Course request) {
        User user = currentUser();
        // 最小实现：将当前用户设为 author
        request.setAuthorId(user.getId());
        Course created = courseService.createCourse(request);
        return ResponseEntity.created(URI.create("/api/courses/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> update(@PathVariable Long id, @RequestBody Course request) {
        User user = currentUser();
        Course updated = courseService.updateCourse(id, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User user = currentUser();
        courseService.deleteCourse(id, user);
        return ResponseEntity.noContent().build();
    }
}
