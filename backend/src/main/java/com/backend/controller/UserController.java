package com.backend.controller;

import com.backend.entity.User;
import com.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效或缺少令牌");
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getProfile() {
        User user = currentUser();
        User full = userService.getById(user.getId());
        Map<String, Object> body = new HashMap<>();
        body.put("id", full.getId());
        body.put("username", full.getUsername());
        body.put("role", full.getRole().name());
        body.put("nickname", full.getNickname());
        body.put("bio", full.getBio());
        body.put("hasAvatar", full.getAvatar() != null && full.getAvatar().length > 0);
        return ResponseEntity.ok(body);
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, String> request) {
        User user = currentUser();
        String nickname = request.get("nickname");
        String bio = request.get("bio");
        User updated = userService.updateProfile(user.getId(), nickname, bio);
        Map<String, Object> body = new HashMap<>();
        body.put("id", updated.getId());
        body.put("username", updated.getUsername());
        body.put("role", updated.getRole().name());
        body.put("nickname", updated.getNickname());
        body.put("bio", updated.getBio());
        body.put("hasAvatar", updated.getAvatar() != null && updated.getAvatar().length > 0);
        return ResponseEntity.ok(body);
    }

    @GetMapping(value = "/me/avatar", produces = { MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, "image/gif", "image/webp" })
    public ResponseEntity<byte[]> getAvatar() {
        User user = currentUser();
        User full = userService.getById(user.getId());
        if (full.getAvatar() == null || full.getAvatar().length == 0) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(full.getAvatar());
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User user = currentUser();
        userService.setAvatar(user.getId(), file);
        Map<String, Object> body = new HashMap<>();
        body.put("message", "头像上传成功");
        return ResponseEntity.ok(body);
    }
}
