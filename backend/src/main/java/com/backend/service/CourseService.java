package com.backend.service;

import com.backend.entity.Course;
import com.backend.entity.User;
import com.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;

    public List<Course> listCourses(String q, List<String> tags, Course.Level level) {
        List<Course> all = courseRepository.findAll();
        String qLower = q == null ? null : q.toLowerCase();
        return all.stream()
                .filter(c -> {
                    if (qLower != null && !qLower.isBlank()) {
                        String title = c.getTitle() == null ? "" : c.getTitle().toLowerCase();
                        String desc = c.getDescription() == null ? "" : c.getDescription().toLowerCase();
                        if (!title.contains(qLower) && !desc.contains(qLower)) {
                            return false;
                        }
                    }
                    if (tags != null && !tags.isEmpty()) {
                        List<String> courseTags = c.getTags() == null ? List.of() : c.getTags();
                        if (!courseTags.containsAll(tags)) {
                            return false;
                        }
                    }
                    if (level != null && c.getLevel() != level) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Course getCourse(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
    }

    public Course createCourse(Course request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (courseRepository.existsByTitle(request.getTitle())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course title already exists");
        }
        request.setId(null);
        return courseRepository.save(request);
    }

    public Course updateCourse(Long id, Course request, User user) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");
        }

        String newTitle = request.getTitle();
        if (newTitle != null && !newTitle.isBlank() && !newTitle.equals(existing.getTitle())) {
            if (courseRepository.existsByTitle(newTitle)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Course title already exists");
            }
            existing.setTitle(newTitle);
        }

        if (request.getDescription() != null) existing.setDescription(request.getDescription());
        if (request.getTags() != null) existing.setTags(request.getTags());
        if (request.getLevel() != null) existing.setLevel(request.getLevel());
        if (request.getSyllabus() != null) existing.setSyllabus(request.getSyllabus());

        return courseRepository.save(existing);
    }

    public void deleteCourse(Long id, User user) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");
        }

        courseRepository.deleteById(id);
    }
}
