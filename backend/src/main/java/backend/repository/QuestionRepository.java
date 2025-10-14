package backend.repository;

import backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByKnowledgePointPointId(Long pointId);

    @Query(value = "SELECT * FROM questions WHERE point_id = :pointId ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestionsByPointId(@Param("pointId") Long pointId,
                                                @Param("count") int count);
}