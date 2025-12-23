package com.backend.controller;

import com.backend.entity.Post;
import com.backend.entity.User;
import com.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<Post>> list(@PathVariable Long courseId) {
        List<Post> posts = postService.getPostsByCourseId(courseId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> get(@PathVariable Long courseId, @PathVariable Long postId) {
        Post post = postService.getPost(postId);
        if (!post.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<Post> create(@PathVariable Long courseId, @RequestBody Post request) {
        User user = currentUser();
        Post created = postService.createPost(courseId, request, user);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/posts/" + created.getId())).body(created);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> update(@PathVariable Long courseId, @PathVariable Long postId, @RequestBody Post request) {
        User user = currentUser();
        Post updated = postService.updatePost(courseId, postId, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId, @PathVariable Long postId) {
        User user = currentUser();
        postService.deletePost(courseId, postId, user);
        return ResponseEntity.noContent().build();
    }
}

