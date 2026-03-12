package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String avatarUrl;
    private String bio;
    private String role;
    private int reputationPoints;
    private boolean banned;
    private LocalDateTime createdAt;
    private long doubtsCount;
    private long answersCount;
    private long acceptedAnswersCount;
    private List<SkillTagDto> skillTags;
}
