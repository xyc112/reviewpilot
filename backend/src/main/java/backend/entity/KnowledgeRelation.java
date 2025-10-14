package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Data
@Slf4j
@Entity
@Table(name = "knowledge_relations")
public class KnowledgeRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long relationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_point_id", nullable = false)
    private KnowledgePoint sourcePoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_point_id", nullable = false)
    private KnowledgePoint targetPoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RelationType relationType;

    public enum RelationType {
        PREREQUISITE, PART_OF, RELATED_TO
    }
}