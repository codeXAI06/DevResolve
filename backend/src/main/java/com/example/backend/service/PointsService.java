package com.example.backend.service;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PointsService {

    private final UserRepository userRepository;

    @Transactional
    public void awardPoints(String userId, int points, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setReputationPoints(user.getReputationPoints() + points);
        userRepository.save(user);
        log.info("Awarded {} points to user {} for: {}", points, user.getUsername(), reason);
    }

    @Transactional
    public boolean deductPoints(String userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getReputationPoints() < points) {
            return false;
        }

        user.setReputationPoints(user.getReputationPoints() - points);
        userRepository.save(user);
        return true;
    }
}
