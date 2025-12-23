package com.backend.service;

import com.backend.entity.Comment;
import com.backend.entity.Post;
import com.backend.entity.User;
import com.backend.repository.CommentRepository;
import com.backend.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public List<Comment> getCommentsByPostId(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public Comment getComment(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    public Comment createComment(Long courseId, Long postId, Comment request, User user) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!Objects.equals(post.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "content is required");
        }

        // 如果指定了parentId，验证父评论是否存在且属于同一个帖子
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            if (!Objects.equals(parent.getPostId(), postId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parent comment does not belong to this post");
            }
        }

        request.setId(null);
        request.setPostId(postId);
        request.setAuthorId(user.getId());
        return commentRepository.save(request);
    }

    public Comment updateComment(Long courseId, Long postId, Long commentId, Comment request, User user) {
        Comment existing = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!Objects.equals(existing.getPostId(), postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this post");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!Objects.equals(post.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        // 只有作者可以修改评论
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only comment owner can update");
        }

        if (request.getContent() != null && !request.getContent().isBlank()) {
            existing.setContent(request.getContent());
        }

        return commentRepository.save(existing);
    }

    public void deleteComment(Long courseId, Long postId, Long commentId, User user) {
        Comment existing = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!Objects.equals(existing.getPostId(), postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment does not belong to this post");
        }

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!Objects.equals(post.getCourseId(), courseId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Post does not belong to this course");
        }

        // 作者和管理员都可以删除评论
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isOwner = Objects.equals(existing.getAuthorId(), user.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not comment owner or admin");
        }

        commentRepository.deleteById(commentId);
    }
}

