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
public class CollabRoomResponse {
    private String id;
    private String doubtId;
    private CreatedByDto createdBy;
    private String codeContent;
    private String language;
    private boolean active;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatedByDto {
        private String id;
        private String username;
    }
}
