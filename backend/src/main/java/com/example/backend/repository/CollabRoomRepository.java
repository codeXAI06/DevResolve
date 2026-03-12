package com.example.backend.repository;

import com.example.backend.model.CollabRoom;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollabRoomRepository extends JpaRepository<CollabRoom, String> {
    List<CollabRoom> findByDoubtId(String doubtId);

    @Query("SELECT r FROM CollabRoom r JOIN FETCH r.createdBy WHERE r.active = true")
    List<CollabRoom> findByActiveTrue();

    @Query("SELECT r FROM CollabRoom r JOIN FETCH r.createdBy LEFT JOIN FETCH r.doubt WHERE r.id = :id")
    Optional<CollabRoom> findByIdWithDetails(@Param("id") String id);

    @Query("SELECT DISTINCT r FROM CollabRoom r JOIN FETCH r.createdBy WHERE r.active = true AND (r.createdBy = :user OR :user MEMBER OF r.participants) ORDER BY r.createdAt DESC")
    List<CollabRoom> findByUserParticipation(@Param("user") User user);
}
