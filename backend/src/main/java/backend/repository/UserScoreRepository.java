package backend.repository;

import backend.entity.UserScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface UserScoreRepository extends JpaRepository<UserScore, Long> {

    List<UserScore> findByUserUserId(Long userId);

    List<UserScore> findByKnowledgePointPointId(Long pointId);

    @Query("SELECT us FROM UserScore us WHERE us.user.userId = :userId AND us.knowledgePoint.pointId = :pointId")
    List<UserScore> findByUserAndKnowledgePoint(@Param("userId") Long userId,
                                                @Param("pointId") Long pointId);

    @Query("SELECT AVG(us.scoreValue) FROM UserScore us WHERE us.knowledgePoint.pointId = :pointId")
    Optional<Double> findAverageScoreByKnowledgePoint(@Param("pointId") Long pointId);
}