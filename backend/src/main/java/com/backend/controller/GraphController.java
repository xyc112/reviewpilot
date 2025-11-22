package com.backend.controller;

import com.backend.entity.Graph;
import com.backend.entity.User;
import com.backend.service.CourseService;
import com.backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/graphs")
@RequiredArgsConstructor
public class GraphController {
    private final GraphService graphService;
    private final CourseService courseService;

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) return (User) principal;
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing token");
    }

    private boolean isWriter(Long courseId, User user) {
        var course = courseService.getCourse(courseId); // 若不存在会抛 404
        return user.getRole() == User.Role.ADMIN || Objects.equals(course.getAuthorId(), user.getId());
    }

    // ---- Nodes ----

    @GetMapping("/{courseId}/nodes")
    public ResponseEntity<List<Graph.Node>> listNodes(@PathVariable Long courseId) {
        return ResponseEntity.ok(graphService.listNodes(courseId));
    }

    @GetMapping("/{courseId}/nodes/{nodeId}")
    public ResponseEntity<Map<String, Object>> getNode(@PathVariable Long courseId, @PathVariable String nodeId) {
        return ResponseEntity.ok(graphService.getNode(courseId, nodeId));
    }

    @PostMapping("/{courseId}/nodes")
    public ResponseEntity<Graph.Node> createNode(@PathVariable Long courseId, @RequestBody Graph.Node request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        Graph.Node created = graphService.createNode(courseId, request);
        return ResponseEntity.created(URI.create("/api/graphs/" + courseId + "/nodes/" + created.getId())).body(created);
    }

    @PutMapping("/{courseId}/nodes/{nodeId}")
    public ResponseEntity<Graph.Node> updateNode(@PathVariable Long courseId, @PathVariable String nodeId, @RequestBody Graph.Node request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        Graph.Node updated = graphService.updateNode(courseId, nodeId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{courseId}/nodes/{nodeId}")
    public ResponseEntity<Void> deleteNode(@PathVariable Long courseId, @PathVariable String nodeId) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        graphService.deleteNode(courseId, nodeId);
        return ResponseEntity.noContent().build();
    }

    // ---- Relations ----

    @GetMapping("/{courseId}/relations")
    public ResponseEntity<List<Graph.Relation>> listRelations(
            @PathVariable Long courseId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String type
    ) {
        return ResponseEntity.ok(graphService.listRelations(courseId, from, to, type));
    }

    @PostMapping("/{courseId}/relations")
    public ResponseEntity<Graph.Relation> createRelation(@PathVariable Long courseId, @RequestBody Graph.Relation request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        Graph.Relation created = graphService.createRelation(courseId, request);
        return ResponseEntity.created(URI.create("/api/graphs/" + courseId + "/relations/" + created.getId())).body(created);
    }

    @PutMapping("/{courseId}/relations/{relationId}")
    public ResponseEntity<Graph.Relation> updateRelation(@PathVariable Long courseId, @PathVariable String relationId, @RequestBody Graph.Relation request) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        Graph.Relation updated = graphService.updateRelation(courseId, relationId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{courseId}/relations/{relationId}")
    public ResponseEntity<Void> deleteRelation(@PathVariable Long courseId, @PathVariable String relationId) {
        User user = currentUser();
        if (!isWriter(courseId, user)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not course owner or admin");

        graphService.deleteRelation(courseId, relationId);
        return ResponseEntity.noContent().build();
    }
}
