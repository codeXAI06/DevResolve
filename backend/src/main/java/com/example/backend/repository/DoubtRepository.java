package com.example.backend.repository;

import com.example.backend.model.Doubt;
import com.example.backend.model.DoubtStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoubtRepository extends JpaRepository<Doubt, String> {

    @Query(value = "SELECT d FROM Doubt d JOIN FETCH d.author WHERE d.status = :status",
           countQuery = "SELECT COUNT(d) FROM Doubt d WHERE d.status = :status")
    Page<Doubt> findByStatus(@Param("status") DoubtStatus status, Pageable pageable);

    @Query(value = "SELECT d FROM Doubt d JOIN FETCH d.author WHERE d.author.id = :authorId",
           countQuery = "SELECT COUNT(d) FROM Doubt d WHERE d.author.id = :authorId")
    Page<Doubt> findByAuthorId(@Param("authorId") String authorId, Pageable pageable);

    @Query(value = "SELECT d FROM Doubt d JOIN FETCH d.author WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%'))",
           countQuery = "SELECT COUNT(d) FROM Doubt d WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Doubt> searchByQuery(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT d FROM Doubt d JOIN FETCH d.author JOIN d.tags t WHERE t.name = :tagName",
           countQuery = "SELECT COUNT(d) FROM Doubt d JOIN d.tags t WHERE t.name = :tagName")
    Page<Doubt> findByTagName(@Param("tagName") String tagName, Pageable pageable);

    @Query("SELECT d FROM Doubt d WHERE d.status = 'OPEN' AND d.createdAt <= :cutoff AND SIZE(d.answers) = 0")
    List<Doubt> findUnansweredOlderThan(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(d) FROM Doubt d WHERE d.createdAt >= :since")
    long countDoubtsSince(LocalDateTime since);

    @Query("SELECT d FROM Doubt d JOIN FETCH d.author WHERE LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Doubt> findSimilarByTitle(@Param("title") String title, Pageable pageable);

    @Query(value = "SELECT d FROM Doubt d JOIN FETCH d.author",
           countQuery = "SELECT COUNT(d) FROM Doubt d")
    Page<Doubt> findAllWithAuthor(Pageable pageable);

    @Query("SELECT d FROM Doubt d JOIN FETCH d.author LEFT JOIN FETCH d.answers WHERE d.id = :id")
    Optional<Doubt> findByIdWithAuthorAndAnswers(@Param("id") String id);
}
