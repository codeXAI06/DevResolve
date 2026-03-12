package com.example.backend.controller;

import com.example.backend.dto.AnswerResponse;
import com.example.backend.dto.CreateAnswerRequest;
import com.example.backend.model.CollabRoom;
import com.example.backend.repository.CollabRoomRepository;
import com.example.backend.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@Controller
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequiredArgsConstructor
public class WebSocketController {

    private final AnswerService answerService;
    private final CollabRoomRepository collabRoomRepository;

    /**
     * Handle real-time answer submissions via WebSocket
     * Client sends to: /app/doubt/{doubtId}/answer
     * Broadcasts to: /topic/doubt/{doubtId}
     */
    @MessageMapping("/doubt/{doubtId}/answer")
    @SendTo("/topic/doubt/{doubtId}")
    public AnswerResponse handleNewAnswer(
            @DestinationVariable String doubtId,
            @Payload Map<String, String> payload
    ) {
        CreateAnswerRequest request = CreateAnswerRequest.builder()
                .content(payload.get("content"))
                .codeSnippet(payload.get("codeSnippet"))
                .build();

        String username = payload.get("username");
        AnswerResponse answer = answerService.createAnswer(doubtId, request, username);

        return answer;
    }

    /**
     * Handle typing indicators
     * Client sends to: /app/doubt/{doubtId}/typing
     * Broadcasts to: /topic/doubt/{doubtId}/typing
     */
    @MessageMapping("/doubt/{doubtId}/typing")
    @SendTo("/topic/doubt/{doubtId}/typing")
    public Map<String, Object> handleTyping(
            @DestinationVariable String doubtId,
            @Payload Map<String, Object> payload
    ) {
        return payload; // { username, isTyping }
    }

    /**
     * Handle collab room code changes
     * Client sends to: /app/collab/{roomId}/code
     * Broadcasts to: /topic/collab/{roomId}
     */
    @MessageMapping("/collab/{roomId}/code")
    @SendTo("/topic/collab/{roomId}")
    public Map<String, Object> handleCodeChange(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload
    ) {
        // Persist code to DB
        collabRoomRepository.findById(roomId).ifPresent(room -> {
            room.setCodeContent((String) payload.get("code"));
            collabRoomRepository.save(room);
        });
        return payload; // { username, code, cursorPosition }
    }

    /**
     * Handle cursor position in collab room
     * Client sends to: /app/collab/{roomId}/cursor
     * Broadcasts to: /topic/collab/{roomId}/cursor
     */
    @MessageMapping("/collab/{roomId}/cursor")
    @SendTo("/topic/collab/{roomId}/cursor")
    public Map<String, Object> handleCursor(
            @DestinationVariable String roomId,
            @Payload Map<String, Object> payload
    ) {
        return payload; // { username, line, column }
    }
}
