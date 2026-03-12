package com.example.backend.repository;

import com.example.backend.model.UserSkillTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSkillTagRepository extends JpaRepository<UserSkillTag, String> {
    List<UserSkillTag> findByUserId(String userId);
    void deleteByUserId(String userId);
}
