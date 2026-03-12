package com.example.backend.service;

import com.example.backend.dto.UserProfileResponse;
import com.example.backend.dto.SkillTagDto;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.User;
import com.example.backend.repository.AnswerRepository;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.UserSkillTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DoubtRepository doubtRepository;
    private final AnswerRepository answerRepository;
    private final UserSkillTagRepository skillTagRepository;

    public UserProfileResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToProfile(user);
    }

    public UserProfileResponse getUserProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return mapToProfile(user);
    }

    public Page<UserProfileResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable).map(this::mapToProfile);
    }

    @Transactional
    public void banUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setBanned(true);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setBanned(false);
        userRepository.save(user);
    }

    public Page<UserProfileResponse> getTopUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findTopByReputation(pageable).map(this::mapToProfile);
    }

    private UserProfileResponse mapToProfile(User user) {
        long doubtsCount = doubtRepository.findByAuthorId(user.getId(), Pageable.unpaged()).getTotalElements();
        long answersCount = answerRepository.countByAuthorId(user.getId());
        long acceptedCount = answerRepository.countByAuthorIdAndAccepted(user.getId(), true);

        var skills = skillTagRepository.findByUserId(user.getId()).stream()
                .map(s -> SkillTagDto.builder()
                        .tagName(s.getTagName())
                        .proficiencyScore(s.getProficiencyScore())
                        .build())
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole().name())
                .reputationPoints(user.getReputationPoints())
                .banned(user.isBanned())
                .createdAt(user.getCreatedAt())
                .doubtsCount(doubtsCount)
                .answersCount(answersCount)
                .acceptedAnswersCount(acceptedCount)
                .skillTags(skills)
                .build();
    }
}
