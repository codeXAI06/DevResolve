package com.example.backend.controller;

import com.example.backend.dto.CreateDoubtRequest;
import com.example.backend.dto.DoubtResponse;
import com.example.backend.model.DoubtStatus;
import com.example.backend.service.DoubtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api/doubts")
@RequiredArgsConstructor
public class DoubtController {

    private final DoubtService doubtService;

    @GetMapping
    public ResponseEntity<Page<DoubtResponse>> getAllDoubts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy
    ) {
        return ResponseEntity.ok(doubtService.getAllDoubts(page, size, sortBy));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<DoubtResponse>> searchDoubts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(doubtService.searchDoubts(q, page, size));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<DoubtResponse>> getDoubtsByStatus(
            @PathVariable DoubtStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(doubtService.getDoubtsByStatus(status, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<DoubtResponse>> getDoubtsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(doubtService.getDoubtsByUser(userId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoubtResponse> getDoubtById(@PathVariable String id) {
        return ResponseEntity.ok(doubtService.getDoubtById(id));
    }

    @PostMapping
    public ResponseEntity<DoubtResponse> createDoubt(
            @Valid @RequestBody CreateDoubtRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(doubtService.createDoubt(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoubtResponse> updateDoubt(
            @PathVariable String id,
            @Valid @RequestBody CreateDoubtRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(doubtService.updateDoubt(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteDoubt(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        doubtService.deleteDoubt(id, userDetails.getUsername(), isAdmin);
        return ResponseEntity.ok(Map.of("message", "Doubt deleted successfully"));
    }

    @PostMapping("/similar")
    public ResponseEntity<List<DoubtResponse>> findSimilarDoubts(@RequestBody Map<String, String> body) {
        String title = body.getOrDefault("title", "");
        return ResponseEntity.ok(doubtService.findSimilarDoubts(title));
    }
}
