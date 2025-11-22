package com.backend.controller;

import com.backend.entity.Note;
import com.backend.entity.User;
import com.backend.service.CourseService;
import com.backend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    private final CourseService courseService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    @GetMapping
    public ResponseEntity<List<Note>> list(@PathVariable Long courseId) {
        User user = currentUser();
        return ResponseEntity.ok(noteService.listNotes(courseId, user));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<Note> get(@PathVariable Long courseId, @PathVariable String noteId) {
        User user = currentUser();
        return ResponseEntity.ok(noteService.getNote(courseId, noteId, user));
    }

    @PostMapping
    public ResponseEntity<Note> create(@PathVariable Long courseId, @RequestBody Note request) {
        User user = currentUser();
        Note created = noteService.createNote(courseId, request, user);
        return ResponseEntity.created(URI.create("/api/courses/" + courseId + "/notes/" + created.getId())).body(created);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<Note> update(@PathVariable Long courseId, @PathVariable String noteId, @RequestBody Note request) {
        User user = currentUser();
        Note updated = noteService.updateNote(courseId, noteId, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId, @PathVariable String noteId) {
        User user = currentUser();
        noteService.deleteNote(courseId, noteId, user);
        return ResponseEntity.noContent().build();
    }
}
