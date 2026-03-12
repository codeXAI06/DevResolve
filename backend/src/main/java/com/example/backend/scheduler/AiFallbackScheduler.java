package com.example.backend.scheduler;

import com.example.backend.model.Doubt;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AnswerService;
import com.example.backend.service.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiFallbackScheduler {

    private final DoubtRepository doubtRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final AnswerService answerService;

    private static final int MAX_DOUBTS_PER_CYCLE = 1;
    private static final long DELAY_BETWEEN_CALLS_MS = 10000;

    /**
     * Every 12 hours, check for unanswered doubts older than 2 days.
     * Generate AI answer for 1 per cycle to minimize API usage.
     * Initial delay of 12 hours to avoid running on startup.
     */
    @Scheduled(initialDelay = 43200000, fixedRate = 43200000) // 12 hours delay + 12 hours interval
    public void generateAiFallbackAnswers() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(2);
        List<Doubt> unansweredDoubts = doubtRepository.findUnansweredOlderThan(cutoff);

        if (unansweredDoubts.isEmpty()) return;

        // Limit batch size to avoid rate limiting
        List<Doubt> batch = unansweredDoubts.size() > MAX_DOUBTS_PER_CYCLE
                ? unansweredDoubts.subList(0, MAX_DOUBTS_PER_CYCLE)
                : unansweredDoubts;

        // Get or create the AI system user
        User aiUser = getOrCreateAiUser();

        for (int i = 0; i < batch.size(); i++) {
            Doubt doubt = batch.get(i);
            try {
                // Add delay between API calls to avoid 429
                if (i > 0) {
                    Thread.sleep(DELAY_BETWEEN_CALLS_MS);
                }

                log.info("Generating AI fallback answer for doubt: {} ({}/{})", doubt.getId(), i + 1, batch.size());

                String aiAnswer = geminiService.generateAnswer(
                        doubt.getTitle(),
                        doubt.getDescription(),
                        doubt.getCodeSnippet()
                );

                // Skip if Gemini returned null (rate limited / error)
                if (aiAnswer == null || aiAnswer.isBlank()) {
                    log.warn("Skipping AI answer for doubt {} — Gemini returned empty/null", doubt.getId());
                    continue;
                }

                String formattedAnswer = """
                        > 🤖 **This is an AI-generated answer** because no community response was received within 15 minutes. \
                        While this aims to be helpful, community members are encouraged to provide their own answers!
                        
                        ---
                        
                        %s
                        """.formatted(aiAnswer);

                answerService.createAiAnswer(doubt.getId(), formattedAnswer, aiUser);
                log.info("AI fallback answer generated for doubt: {}", doubt.getId());
            } catch (Exception e) {
                log.error("Failed to generate AI answer for doubt: {}", doubt.getId(), e);
            }
        }
    }

    private User getOrCreateAiUser() {
        return userRepository.findByUsername("DevResolve-AI")
                .orElseGet(() -> {
                    User ai = User.builder()
                            .username("DevResolve-AI")
                            .email("ai@devresolve.com")
                            .password("$2a$10$PLACEHOLDER_NOT_LOGINABLE")
                            .role(Role.USER)
                            .bio("I'm the DevResolve AI assistant. I provide fallback answers when the community is busy!")
                            .avatarUrl("/ai-avatar.png")
                            .build();
                    return userRepository.save(ai);
                });
    }
}
