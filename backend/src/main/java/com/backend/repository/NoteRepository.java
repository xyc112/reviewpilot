package com.backend.repository;

import com.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findByCourseId(Long courseId);
    Optional<Note> findByCourseIdAndId(Long courseId, String id);
    long countByCourseIdAndAuthorId(Long courseId, Long authorId);
}
