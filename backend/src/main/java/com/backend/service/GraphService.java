package com.backend.service;

import com.backend.entity.Graph;
import com.backend.repository.GraphRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraphService {
    private final CourseService courseService;
    private final GraphRepository graphRepository;

    private void ensureCourseExists(Long courseId) {
        courseService.getCourse(courseId);
    }

    private Graph getOrCreateGraph(Long courseId) {
        ensureCourseExists(courseId);
        return graphRepository.getOrCreate(courseId);
    }

    // Nodes

    public List<Graph.Node> listNodes(Long courseId) {
        Graph g = getOrCreateGraph(courseId);
        return Optional.ofNullable(g.getNodes()).orElse(List.of());
    }

    public Map<String, Object> getNode(Long courseId, String nodeId) {
        Graph g = getOrCreateGraph(courseId);
        Graph.Node node = Optional.ofNullable(g.getNodes()).orElse(List.of()).stream()
                .filter(n -> Objects.equals(n.getId(), nodeId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found"));

        long out = Optional.ofNullable(g.getRelations()).orElse(List.of()).stream().filter(r -> nodeId.equals(r.getFrom())).count();
        long in = Optional.ofNullable(g.getRelations()).orElse(List.of()).stream().filter(r -> nodeId.equals(r.getTo())).count();

        Map<String, Object> resp = new HashMap<>();
        resp.put("node", node);
        resp.put("inDegree", in);
        resp.put("outDegree", out);
        return resp;
    }

    public Graph.Node createNode(Long courseId, Graph.Node request) {
        if (request.getLabel() == null || request.getLabel().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "label is required");
        }

        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            boolean dup = Optional.ofNullable(g.getNodes()).orElse(List.of()).stream()
                    .anyMatch(n -> n.getLabel() != null && n.getLabel().equalsIgnoreCase(request.getLabel()));
            if (dup) throw new ResponseStatusException(HttpStatus.CONFLICT, "Node with same label exists");

            String id = graphRepository.nextNodeId(courseId);

            Graph.Node node = Graph.Node.builder()
                    .id(id)
                    .label(request.getLabel())
                    .type(request.getType())
                    .description(request.getDescription())
                    .meta(request.getMeta())
                    .build();

            if (g.getNodes() == null) g.setNodes(new ArrayList<>());
            g.getNodes().add(node);
            graphRepository.save(g);
            return node;
        }
    }

    public Graph.Node updateNode(Long courseId, String nodeId, Graph.Node request) {
        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            List<Graph.Node> nodes = Optional.ofNullable(g.getNodes()).orElse(List.of());
            Graph.Node existing = nodes.stream().filter(n -> Objects.equals(n.getId(), nodeId)).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found"));

            String newLabel = request.getLabel();
            if (newLabel != null && !newLabel.isBlank() && !newLabel.equalsIgnoreCase(existing.getLabel())) {
                boolean dup = nodes.stream()
                        .filter(n -> !Objects.equals(n.getId(), nodeId))
                        .anyMatch(n -> n.getLabel() != null && n.getLabel().equalsIgnoreCase(newLabel));
                if (dup) throw new ResponseStatusException(HttpStatus.CONFLICT, "Node with same label exists");
                existing.setLabel(newLabel);
            }

            if (request.getType() != null) existing.setType(request.getType());
            if (request.getDescription() != null) existing.setDescription(request.getDescription());
            if (request.getMeta() != null) existing.setMeta(request.getMeta());

            graphRepository.save(g);
            return existing;
        }
    }

    public void deleteNode(Long courseId, String nodeId) {
        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            boolean referenced = Optional.ofNullable(g.getRelations()).orElse(List.of()).stream()
                    .anyMatch(r -> nodeId.equals(r.getFrom()) || nodeId.equals(r.getTo()));
            if (referenced) throw new ResponseStatusException(HttpStatus.CONFLICT, "Node is referenced by relations");

            List<Graph.Node> nodes = Optional.ofNullable(g.getNodes()).orElse(List.of());
            boolean removed = nodes.removeIf(n -> Objects.equals(n.getId(), nodeId));
            if (!removed) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Node not found");

            graphRepository.save(g);
        }
    }

    // Relations

    public List<Graph.Relation> listRelations(Long courseId, String from, String to, String type) {
        Graph g = getOrCreateGraph(courseId);
        List<Graph.Relation> all = Optional.ofNullable(g.getRelations()).orElse(List.of());
        return all.stream()
                .filter(r -> from == null || from.isBlank() || from.equals(r.getFrom()))
                .filter(r -> to == null || to.isBlank() || to.equals(r.getTo()))
                .filter(r -> type == null || type.isBlank() || type.equalsIgnoreCase(r.getType()))
                .collect(Collectors.toList());
    }

    public Graph.Relation createRelation(Long courseId, Graph.Relation request) {
        if (request.getFrom() == null || request.getFrom().isBlank()
                || request.getTo() == null || request.getTo().isBlank()
                || request.getType() == null || request.getType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "from, to and type are required");
        }

        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            Set<String> nodeIds = Optional.ofNullable(g.getNodes()).orElse(List.of()).stream().map(Graph.Node::getId).collect(Collectors.toSet());
            if (!nodeIds.contains(request.getFrom()) || !nodeIds.contains(request.getTo())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Source or target node not found");
            }

            boolean dup = Optional.ofNullable(g.getRelations()).orElse(List.of()).stream()
                    .anyMatch(r -> Objects.equals(r.getFrom(), request.getFrom())
                            && Objects.equals(r.getTo(), request.getTo())
                            && r.getType() != null && r.getType().equalsIgnoreCase(request.getType()));
            if (dup) throw new ResponseStatusException(HttpStatus.CONFLICT, "Relation already exists");

            String id = graphRepository.nextRelationId(courseId);

            Graph.Relation rel = Graph.Relation.builder()
                    .id(id)
                    .from(request.getFrom())
                    .to(request.getTo())
                    .type(request.getType())
                    .directed(request.getDirected() == null ? Boolean.TRUE : request.getDirected())
                    .weight(request.getWeight())
                    .meta(request.getMeta())
                    .build();

            if (g.getRelations() == null) g.setRelations(new ArrayList<>());
            g.getRelations().add(rel);
            graphRepository.save(g);
            return rel;
        }
    }

    public Graph.Relation updateRelation(Long courseId, String relationId, Graph.Relation request) {
        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            List<Graph.Relation> rels = Optional.ofNullable(g.getRelations()).orElse(List.of());
            Graph.Relation existing = rels.stream().filter(r -> Objects.equals(r.getId(), relationId)).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Relation not found"));

            if (request.getType() != null) existing.setType(request.getType());
            if (request.getDirected() != null) existing.setDirected(request.getDirected());
            if (request.getWeight() != null) {
                if (request.getWeight() < 0.0 || request.getWeight() > 1.0)
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weight must be between 0 and 1");
                existing.setWeight(request.getWeight());
            }
            if (request.getMeta() != null) existing.setMeta(request.getMeta());

            graphRepository.save(g);
            return existing;
        }
    }

    public void deleteRelation(Long courseId, String relationId) {
        Graph g = getOrCreateGraph(courseId);
        synchronized (g) {
            boolean removed = Optional.ofNullable(g.getRelations()).orElse(List.of()).removeIf(r -> Objects.equals(r.getId(), relationId));
            if (!removed) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Relation not found");
            graphRepository.save(g);
        }
    }
}
