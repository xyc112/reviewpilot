package backend.repository;

import backend.entity.UserNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface UserNoteRepository extends JpaRepository<UserNote, Long> {

    @Query("SELECT un FROM UserNote un WHERE un.user.userId = :userId AND un.knowledgePoint.pointId = :pointId")
    Optional<UserNote> findByUserAndKnowledgePoint(@Param("userId") Long userId,
                                                   @Param("pointId") Long pointId);

    List<UserNote> findByUserUserId(Long userId);

    List<UserNote> findByKnowledgePointPointId(Long pointId);
}