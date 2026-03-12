package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResponse {
    private String id;
    private String content;
    private String codeSnippet;
    private String doubtId;
    private AuthorDto author;
    private boolean accepted;
    private boolean aiGenerated;
    private Integer accuracyScore;
    private Integer clarityScore;
    private Integer codeQualityScore;
    private int upvotes;
    private int downvotes;
    private LocalDateTime createdAt;
}
