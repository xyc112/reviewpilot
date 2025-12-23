package com.backend.controller;

import com.backend.entity.Comment;
import com.backend.entity.User;
import com.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<Comment>> list(@PathVariable Long courseId, @PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<Comment> get(@PathVariable Long courseId, @PathVariable Long postId, @PathVariable Long commentId) {
        Comment comment = commentService.getComment(commentId);
        if (!comment.getPostId().equals(postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this post");
        }
        return ResponseEntity.ok(comment);
    }

    @PostMapping
    public ResponseEntity<Comment> create(@PathVariable Long courseId, @PathVariable Long postId, @RequestBody Comment request) {
        User user = currentUser();
        Comment created = commentService.createComment(courseId, postId, request, user);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/posts/" + postId + "/comments/" + created.getId())).body(created);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> update(@PathVariable Long courseId, @PathVariable Long postId, @PathVariable Long commentId, @RequestBody Comment request) {
        User user = currentUser();
        Comment updated = commentService.updateComment(courseId, postId, commentId, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId, @PathVariable Long postId, @PathVariable Long commentId) {
        User user = currentUser();
        commentService.deleteComment(courseId, postId, commentId, user);
        return ResponseEntity.noContent().build();
    }
}

