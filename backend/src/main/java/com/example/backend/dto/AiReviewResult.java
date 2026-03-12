package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReviewResult {
    private int accuracyScore;
    private int clarityScore;
    private int codeQualityScore;
    private String feedback;
}
