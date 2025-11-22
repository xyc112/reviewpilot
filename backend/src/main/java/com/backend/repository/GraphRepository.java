package com.backend.repository;

import com.backend.entity.Graph;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public interface GraphRepository extends JpaRepository<Graph, Long>, GraphRepositoryCustom {
    Optional<Graph> findByCourseId(Long courseId);
    boolean existsByCourseId(Long courseId);
}

interface GraphRepositoryCustom {
    Graph getOrCreate(Long courseId);
    String nextNodeId(Long courseId);
    String nextRelationId(Long courseId);
}

@Repository
@Transactional
class GraphRepositoryImpl implements GraphRepositoryCustom {
    @PersistenceContext
    private EntityManager em;

    @Override
    public Graph getOrCreate(Long courseId) {
        Graph g = em.find(Graph.class, courseId);
        if (g != null) return g;
        Graph newG = Graph.builder().courseId(courseId).nodes(null).relations(null).build();
        em.persist(newG);
        // flush to ensure entity managed and visible
        em.flush();
        return newG;
    }

    @Override
    public String nextNodeId(Long courseId) {
        Graph g = getOrCreate(courseId);
        List<Graph.Node> nodes = g.getNodes();
        int max = 0;
        if (nodes != null && !nodes.isEmpty()) {
            max = nodes.stream()
                    .map(Graph.Node::getId)
                    .filter(id -> id != null && id.startsWith("n"))
                    .map(id -> {
                        try {
                            return Integer.parseInt(id.substring(1));
                        } catch (Exception ex) {
                            return 0;
                        }
                    })
                    .max(Comparator.naturalOrder())
                    .orElse(0);
        }
        return "n" + (max + 1);
    }

    @Override
    public String nextRelationId(Long courseId) {
        Graph g = getOrCreate(courseId);
        List<Graph.Relation> rels = g.getRelations();
        int max = 0;
        if (rels != null && !rels.isEmpty()) {
            max = rels.stream()
                    .map(Graph.Relation::getId)
                    .filter(id -> id != null && id.startsWith("r"))
                    .map(id -> {
                        try {
                            return Integer.parseInt(id.substring(1));
                        } catch (Exception ex) {
                            return 0;
                        }
                    })
                    .max(Comparator.naturalOrder())
                    .orElse(0);
        }
        return "r" + (max + 1);
    }
}
