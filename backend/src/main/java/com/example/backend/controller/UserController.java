package com.example.backend.controller;

import com.example.backend.dto.UserProfileResponse;
import com.example.backend.model.Reward;
import com.example.backend.model.RewardRedemption;
import com.example.backend.service.RewardService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RewardService rewardService;

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<UserProfileResponse> getUserDashboard(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileResponse> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserProfileByUsername(username));
    }

    @GetMapping("/top")
    public ResponseEntity<?> getTopUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userService.getTopUsers(page, size));
    }

    @GetMapping("/me/rewards")
    public ResponseEntity<List<Reward>> getAvailableRewards() {
        return ResponseEntity.ok(rewardService.getAvailableRewards());
    }

    @PostMapping("/me/rewards/redeem")
    public ResponseEntity<Map<String, String>> redeemReward(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String rewardId = body.get("rewardId");
        rewardService.redeemReward(rewardId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Reward redeemed successfully"));
    }
}
