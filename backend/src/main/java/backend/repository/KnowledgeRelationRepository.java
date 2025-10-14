package backend.repository;

import backend.entity.KnowledgeRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeRelationRepository extends JpaRepository<KnowledgeRelation, Long> {

    @Query("SELECT kr FROM KnowledgeRelation kr WHERE kr.sourcePoint.course.courseId = :courseId OR kr.targetPoint.course.courseId = :courseId")
    List<KnowledgeRelation> findByCourseId(@Param("courseId") Long courseId);

    List<KnowledgeRelation> findBySourcePointPointId(Long sourcePointId);

    List<KnowledgeRelation> findByTargetPointPointId(Long targetPointId);
}