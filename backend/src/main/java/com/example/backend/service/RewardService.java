package com.example.backend.service;

import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Reward;
import com.example.backend.model.RewardRedemption;
import com.example.backend.model.User;
import com.example.backend.repository.RewardRedemptionRepository;
import com.example.backend.repository.RewardRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    public List<Reward> getAvailableRewards() {
        return rewardRepository.findByActiveTrue();
    }

    @Transactional
    public RewardRedemption redeemReward(String rewardId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward", "id", rewardId));

        if (!reward.isActive()) {
            throw new BadRequestException("This reward is no longer available");
        }

        if (user.getReputationPoints() < reward.getPointsCost()) {
            throw new BadRequestException("Insufficient points. Need " + reward.getPointsCost() + ", have " + user.getReputationPoints());
        }

        pointsService.deductPoints(user.getId(), reward.getPointsCost());

        RewardRedemption redemption = RewardRedemption.builder()
                .user(user)
                .reward(reward)
                .build();

        return redemptionRepository.save(redemption);
    }

    public List<RewardRedemption> getUserRedemptions(String userId) {
        return redemptionRepository.findByUserId(userId);
    }
}
