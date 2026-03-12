package com.example.backend.repository;

import com.example.backend.model.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {

    @Query(value = "SELECT a FROM Answer a JOIN FETCH a.author WHERE a.doubt.id = :doubtId ORDER BY a.accepted DESC, a.createdAt ASC",
           countQuery = "SELECT COUNT(a) FROM Answer a WHERE a.doubt.id = :doubtId")
    Page<Answer> findByDoubtIdOrderByAcceptedDescCreatedAtAsc(@Param("doubtId") String doubtId, Pageable pageable);

    List<Answer> findByDoubtId(String doubtId);

    Page<Answer> findByAuthorId(String authorId, Pageable pageable);

    long countByAuthorIdAndAccepted(String authorId, boolean accepted);

    long countByAuthorId(String authorId);

    @Query("SELECT COUNT(a) FROM Answer a WHERE a.createdAt >= :since")
    long countAnswersSince(LocalDateTime since);

    @Query("SELECT AVG(TIMESTAMPDIFF(MINUTE, d.createdAt, a.createdAt)) FROM Answer a JOIN a.doubt d WHERE a.createdAt >= :since")
    Double avgResponseTimeMinutesSince(LocalDateTime since);
}
