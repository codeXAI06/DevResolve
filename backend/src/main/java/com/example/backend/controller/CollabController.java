package com.example.backend.controller;

import com.example.backend.dto.CollabRoomRequest;
import com.example.backend.dto.CollabRoomResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.CollabRoom;
import com.example.backend.model.Doubt;
import com.example.backend.model.User;
import com.example.backend.repository.CollabRoomRepository;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api/collab")
@RequiredArgsConstructor
public class CollabController {

    private final CollabRoomRepository collabRoomRepository;
    private final DoubtRepository doubtRepository;
    private final UserRepository userRepository;

    @PostMapping("/room")
    public ResponseEntity<CollabRoomResponse> createRoom(
            @RequestBody CollabRoomRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));

        CollabRoom room = CollabRoom.builder()
                .createdBy(user)
                .language(request.getLanguage() != null ? request.getLanguage() : "javascript")
                .codeContent("// Start coding here...\n")
                .build();

        room.getParticipants().add(user);

        if (request.getDoubtId() != null) {
            Doubt doubt = doubtRepository.findById(request.getDoubtId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", request.getDoubtId()));
            room.setDoubt(doubt);
        }

        room = collabRoomRepository.save(room);
        return ResponseEntity.ok(mapToResponse(room));
    }

    @GetMapping("/room/{id}")
    public ResponseEntity<CollabRoomResponse> getRoom(@PathVariable String id) {
        CollabRoom room = collabRoomRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollabRoom", "id", id));
        return ResponseEntity.ok(mapToResponse(room));
    }

    @GetMapping("/rooms/active")
    public ResponseEntity<List<CollabRoomResponse>> getActiveRooms() {
        return ResponseEntity.ok(
                collabRoomRepository.findByActiveTrue().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/rooms/my")
    public ResponseEntity<List<CollabRoomResponse>> getMyRooms(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails == null) {
            return ResponseEntity.ok(List.of());
        }
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));
        return ResponseEntity.ok(
                collabRoomRepository.findByUserParticipation(user).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList())
        );
    }

    @PostMapping("/room/{id}/join")
    public ResponseEntity<Map<String, String>> joinRoom(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CollabRoom room = collabRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollabRoom", "id", id));
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));

        room.getParticipants().add(user);
        collabRoomRepository.save(room);
        return ResponseEntity.ok(Map.of("message", "Joined room"));
    }

    @DeleteMapping("/room/{id}")
    public ResponseEntity<Map<String, String>> closeRoom(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        CollabRoom room = collabRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollabRoom", "id", id));

        // Only the room owner can delete/close the room
        if (room.getCreatedBy() == null || !room.getCreatedBy().getUsername().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the room owner can delete this room"));
        }

        room.setActive(false);
        collabRoomRepository.save(room);
        return ResponseEntity.ok(Map.of("message", "Room closed"));
    }

    @PutMapping("/room/{id}/code")
    public ResponseEntity<Map<String, String>> saveCode(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        CollabRoom room = collabRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CollabRoom", "id", id));

        room.setCodeContent(body.getOrDefault("code", ""));
        collabRoomRepository.save(room);
        return ResponseEntity.ok(Map.of("message", "Code saved"));
    }

    private CollabRoomResponse mapToResponse(CollabRoom room) {
        return CollabRoomResponse.builder()
                .id(room.getId())
                .doubtId(room.getDoubt() != null ? room.getDoubt().getId() : null)
                .createdBy(CollabRoomResponse.CreatedByDto.builder()
                        .id(room.getCreatedBy().getId())
                        .username(room.getCreatedBy().getUsername())
                        .build())
                .codeContent(room.getCodeContent())
                .language(room.getLanguage())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
