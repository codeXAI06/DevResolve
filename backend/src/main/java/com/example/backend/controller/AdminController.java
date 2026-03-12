package com.example.backend.controller;

import com.example.backend.dto.AdminAnalyticsResponse;
import com.example.backend.dto.DoubtResponse;
import com.example.backend.dto.TagUsageDto;
import com.example.backend.dto.UserProfileResponse;
import com.example.backend.repository.AnswerRepository;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.DoubtService;
import com.example.backend.service.TagService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final DoubtService doubtService;
    private final TagService tagService;
    private final UserRepository userRepository;
    private final DoubtRepository doubtRepository;
    private final AnswerRepository answerRepository;

    @GetMapping("/users")
    public ResponseEntity<Page<UserProfileResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(userService.getAllUsers(page, size));
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<Map<String, String>> banUser(@PathVariable String id) {
        userService.banUser(id);
        return ResponseEntity.ok(Map.of("message", "User banned successfully"));
    }

    @PutMapping("/users/{id}/unban")
    public ResponseEntity<Map<String, String>> unbanUser(@PathVariable String id) {
        userService.unbanUser(id);
        return ResponseEntity.ok(Map.of("message", "User unbanned successfully"));
    }

    @GetMapping("/doubts")
    public ResponseEntity<Page<DoubtResponse>> getAllDoubts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(doubtService.getAllDoubts(page, size, "createdAt"));
    }

    @DeleteMapping("/doubts/{id}")
    public ResponseEntity<Map<String, String>> deleteDoubt(@PathVariable String id) {
        doubtService.deleteDoubt(id, null, true);
        return ResponseEntity.ok(Map.of("message", "Doubt deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        AdminAnalyticsResponse analytics = AdminAnalyticsResponse.builder()
                .totalUsers(userRepository.count())
                .totalDoubts(doubtRepository.count())
                .totalAnswers(answerRepository.count())
                .newUsersToday(userRepository.countNewUsersSince(today))
                .newDoubtsToday(doubtRepository.countDoubtsSince(today))
                .avgResponseTimeMinutes(answerRepository.avgResponseTimeMinutesSince(today.minusDays(30)))
                .topTags(tagService.getTrendingTags(10))
                .build();

        return ResponseEntity.ok(analytics);
    }
}
