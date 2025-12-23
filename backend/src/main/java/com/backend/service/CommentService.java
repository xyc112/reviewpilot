package com.backend.service;

import com.backend.entity.Comment;
import com.backend.entity.Post;
import com.backend.entity.User;
import com.backend.repository.CommentRepository;
import com.backend.repository.PostRepository;
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
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<Comment> getCommentsByPostId(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        // 填充用户名
        return comments.stream().map(comment -> {
            userRepository.findById(comment.getAuthorId()).ifPresent(author -> {
                comment.setAuthorUsername(author.getUsername());
            });
            return comment;
        }).collect(Collectors.toList());
    }

    public Comment getComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        // 填充用户名
        userRepository.findById(comment.getAuthorId()).ifPresent(author -> {
            comment.setAuthorUsername(author.getUsername());
        });
        return comment;
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
        Comment saved = commentRepository.save(request);
        saved.setAuthorUsername(user.getUsername());
        return saved;
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

        Comment saved = commentRepository.save(existing);
        userRepository.findById(saved.getAuthorId()).ifPresent(author -> {
            saved.setAuthorUsername(author.getUsername());
        });
        return saved;
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

