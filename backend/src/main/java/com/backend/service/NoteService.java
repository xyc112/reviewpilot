package com.backend.service;

import com.backend.entity.Note;
import com.backend.entity.User;
import com.backend.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final CourseService courseService;

    private void ensureCourseExists(Long courseId) {
        courseService.getCourse(courseId);
    }

    public List<Note> listNotes(Long courseId, User currentUser) {
        ensureCourseExists(courseId);
        List<Note> all = noteRepository.findByCourseId(courseId);
        return all.stream()
                .filter(n -> "public".equalsIgnoreCase(n.getVisibility())
                        || (currentUser != null && Objects.equals(n.getAuthorId(), currentUser.getId())))
                .collect(Collectors.toList());
    }

    public Note getNote(Long courseId, String noteId, User currentUser) {
        ensureCourseExists(courseId);
        Note note = noteRepository.findByCourseIdAndId(courseId, noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));
        if ("private".equalsIgnoreCase(note.getVisibility())) {
            boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
            boolean isOwner = currentUser != null && Objects.equals(note.getAuthorId(), currentUser.getId());
            if (!isAdmin && !isOwner) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view this note");
            }
        }
        return note;
    }

    public Note createNote(Long courseId, Note request, User currentUser) {
        ensureCourseExists(courseId);
        if (request.getTitle() == null || request.getTitle().isBlank()
                || request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title and content are required");
        }
        // generate id like note1, note2 per course (scan existing)
        List<Note> notes = noteRepository.findByCourseId(courseId);
        int max = notes.stream()
                .map(Note::getId)
                .filter(id -> id != null && id.startsWith("note"))
                .map(id -> {
                    try {
                        return Integer.parseInt(id.substring(4));
                    } catch (Exception ex) {
                        return 0;
                    }
                })
                .max(Comparator.naturalOrder())
                .orElse(0);
        String id = "note" + (max + 1);

        Note note = Note.builder()
                .id(id)
                .courseId(courseId)
                .title(request.getTitle())
                .content(request.getContent())
                .authorId(currentUser.getId())
                .visibility(request.getVisibility() == null ? "private" : request.getVisibility())
                .build();

        return noteRepository.save(note);
    }

    public Note updateNote(Long courseId, String noteId, Note request, User currentUser) {
        ensureCourseExists(courseId);
        Note existing = noteRepository.findByCourseIdAndId(courseId, noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        boolean isOwner = currentUser != null && Objects.equals(existing.getAuthorId(), currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not note owner or admin");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) existing.setTitle(request.getTitle());
        if (request.getContent() != null && !request.getContent().isBlank()) existing.setContent(request.getContent());
        if (request.getVisibility() != null && !request.getVisibility().isBlank()) existing.setVisibility(request.getVisibility());

        return noteRepository.save(existing);
    }

    public void deleteNote(Long courseId, String noteId, User currentUser) {
        ensureCourseExists(courseId);
        Note existing = noteRepository.findByCourseIdAndId(courseId, noteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found"));

        boolean isAdmin = currentUser != null && currentUser.getRole() == User.Role.ADMIN;
        boolean isOwner = currentUser != null && Objects.equals(existing.getAuthorId(), currentUser.getId());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not note owner or admin");
        }

        noteRepository.deleteById(existing.getId());
    }
}
