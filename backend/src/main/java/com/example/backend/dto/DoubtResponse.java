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
public class DoubtResponse {
    private String id;
    private String title;
    private String description;
    private String codeSnippet;
    private String status;
    private String acceptedAnswerId;
    private int viewCount;
    private List<String> tags;
    private AuthorDto author;
    private int answerCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
