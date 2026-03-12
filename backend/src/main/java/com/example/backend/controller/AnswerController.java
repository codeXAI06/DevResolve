package com.example.backend.controller;

import com.example.backend.dto.AnswerResponse;
import com.example.backend.dto.CreateAnswerRequest;
import com.example.backend.service.AnswerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    @GetMapping("/doubts/{doubtId}/answers")
    public ResponseEntity<Page<AnswerResponse>> getAnswersByDoubt(
            @PathVariable String doubtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(answerService.getAnswersByDoubt(doubtId, page, size));
    }

    @PostMapping("/doubts/{doubtId}/answers")
    public ResponseEntity<AnswerResponse> createAnswer(
            @PathVariable String doubtId,
            @Valid @RequestBody CreateAnswerRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(answerService.createAnswer(doubtId, request, userDetails.getUsername()));
    }

    @PutMapping("/answers/{answerId}/accept")
    public ResponseEntity<AnswerResponse> acceptAnswer(
            @PathVariable String answerId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(answerService.acceptAnswer(answerId, userDetails.getUsername()));
    }
}
