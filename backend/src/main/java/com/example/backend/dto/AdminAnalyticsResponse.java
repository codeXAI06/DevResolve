package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    private long totalUsers;
    private long totalDoubts;
    private long totalAnswers;
    private long newUsersToday;
    private long newDoubtsToday;
    private Double avgResponseTimeMinutes;
    private List<TagUsageDto> topTags;
    private List<Map<String, Object>> dailyActivity;
}
