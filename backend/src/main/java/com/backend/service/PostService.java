package com.backend.service;

import com.backend.entity.Post;
import com.backend.entity.User;
import com.backend.repository.PostRepository;
import com.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final CourseRepository courseRepository;

    public List<Post> getPostsByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        return postRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public Post getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    }

    public Post createPost(Long courseId, Post request, User user) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }
        request.setId(null);
        request.setCourseId(courseId);
        request.setAuthorId(user.getId());
        return postRepository.save(request);
    }

    public Post updatePost(Long courseId, Long postId, Post request, User user) {
        Post existing = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!Objects.equals(existing.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not post owner or admin");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            existing.setTitle(request.getTitle());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            existing.setContent(request.getContent());
        }

        return postRepository.save(existing);
    }

    public void deletePost(Long courseId, Long postId, User user) {
        Post existing = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!Objects.equals(existing.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not post owner or admin");
        }

        postRepository.deleteById(postId);
    }
}

