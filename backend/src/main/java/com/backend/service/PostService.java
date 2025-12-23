package com.backend.service;

import com.backend.entity.Post;
import com.backend.entity.User;
import com.backend.repository.PostRepository;
import com.backend.repository.CourseRepository;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<Post> getPostsByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        List<Post> posts = postRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        // 填充用户名
        return posts.stream().map(post -> {
            userRepository.findById(post.getAuthorId()).ifPresent(user -> {
                post.setAuthorUsername(user.getUsername());
            });
            return post;
        }).collect(Collectors.toList());
    }

    public Post getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        // 填充用户名
        userRepository.findById(post.getAuthorId()).ifPresent(user -> {
            post.setAuthorUsername(user.getUsername());
        });
        return post;
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
        Post saved = postRepository.save(request);
        saved.setAuthorUsername(user.getUsername());
        return saved;
    }

    public Post updatePost(Long courseId, Long postId, Post request, User user) {
        Post existing = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!Objects.equals(existing.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        // 只有作者可以修改帖子
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only post owner can update");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            existing.setTitle(request.getTitle());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            existing.setContent(request.getContent());
        }

        Post saved = postRepository.save(existing);
        userRepository.findById(saved.getAuthorId()).ifPresent(author -> {
            saved.setAuthorUsername(author.getUsername());
        });
        return saved;
    }

    public void deletePost(Long courseId, Long postId, User user) {
        Post existing = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!Objects.equals(existing.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        // 作者和管理员都可以删除帖子
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not post owner or admin");
        }

        postRepository.deleteById(postId);
    }
}

