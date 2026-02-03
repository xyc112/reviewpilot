package com.backend.service;

import com.backend.entity.CourseFile;
import com.backend.repository.CourseFileRepository;
import com.backend.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseFileService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");
    private static final String ALLOWED_PDF = "application/pdf";

    private final CourseFileRepository courseFileRepository;
    private final CourseRepository courseRepository;

    public List<CourseFile> listByCourseId(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "课程不存在");
        }
        return courseFileRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
    }

    public CourseFile upload(Long courseId, Long userId, MultipartFile file) {
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "课程不存在");
        }
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请选择文件");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!ALLOWED_IMAGE_TYPES.contains(contentType) && !ALLOWED_PDF.equals(contentType))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "仅支持图片（JPEG/PNG/GIF/WebP）或 PDF");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文件大小不能超过 10MB");
        }
        byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "读取文件失败");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            filename = "file";
        }
        CourseFile courseFile = CourseFile.builder()
                .courseId(courseId)
                .filename(filename)
                .contentType(contentType)
                .data(data)
                .uploadedBy(userId)
                .build();
        return courseFileRepository.save(courseFile);
    }

    public CourseFile getFile(Long courseId, Long fileId) {
        CourseFile file = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文件不存在"));
        if (!file.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "文件不存在");
        }
        return file;
    }

    public void delete(Long courseId, Long fileId, Long userId, boolean isAdmin) {
        CourseFile file = getFile(courseId, fileId);
        if (!isAdmin && file.getUploadedBy() != null && !file.getUploadedBy().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "只能删除自己上传的文件");
        }
        courseFileRepository.delete(file);
    }
}
