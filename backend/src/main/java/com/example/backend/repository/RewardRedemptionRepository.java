package com.example.backend.repository;

import com.example.backend.model.RewardRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, String> {
    List<RewardRedemption> findByUserId(String userId);
}
