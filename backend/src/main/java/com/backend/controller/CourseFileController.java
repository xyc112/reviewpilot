package com.backend.controller;

import com.backend.entity.CourseFile;
import com.backend.entity.User;
import com.backend.service.CourseFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseId}/files")
@RequiredArgsConstructor
public class CourseFileController {
    private final CourseFileService courseFileService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效或缺少令牌");
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@PathVariable Long courseId) {
        List<CourseFile> files = courseFileService.listByCourseId(courseId);
        List<Map<String, Object>> list = files.stream()
                .map(f -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", f.getId());
                    m.put("filename", f.getFilename());
                    m.put("contentType", f.getContentType());
                    m.put("uploadedBy", f.getUploadedBy());
                    m.put("createdAt", f.getCreatedAt());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(
            @PathVariable Long courseId,
            @RequestParam("file") MultipartFile file) {
        User user = currentUser();
        CourseFile saved = courseFileService.upload(courseId, user.getId(), file);
        Map<String, Object> body = new HashMap<>();
        body.put("id", saved.getId());
        body.put("filename", saved.getFilename());
        body.put("contentType", saved.getContentType());
        body.put("uploadedBy", saved.getUploadedBy());
        body.put("createdAt", saved.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<byte[]> download(@PathVariable Long courseId, @PathVariable Long fileId) {
        CourseFile f = courseFileService.getFile(courseId, fileId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(f.getContentType()));
        headers.setContentDispositionFormData("attachment", f.getFilename());
        return ResponseEntity.ok()
                .headers(headers)
                .body(f.getData());
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> delete(@PathVariable Long courseId, @PathVariable Long fileId) {
        User user = currentUser();
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        courseFileService.delete(courseId, fileId, user.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
