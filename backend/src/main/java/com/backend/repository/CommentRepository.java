package com.backend.repository;

import com.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    List<Comment> findByPostIdAndParentIdIsNullOrderByCreatedAtAsc(Long postId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
}

