package backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Data
@Slf4j
@Entity
@Table(name = "knowledge_points")
public class KnowledgePoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pointId;

    @Column(nullable = false)
    private String pointName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "sourcePoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KnowledgeRelation> outgoingRelations = new ArrayList<>();

    @OneToMany(mappedBy = "targetPoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<KnowledgeRelation> incomingRelations = new ArrayList<>();

    @OneToMany(mappedBy = "knowledgePoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserScore> userScores = new ArrayList<>();

    @OneToMany(mappedBy = "knowledgePoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserNote> userNotes = new ArrayList<>();

    @OneToMany(mappedBy = "knowledgePoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();
}