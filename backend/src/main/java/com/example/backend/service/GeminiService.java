package com.example.backend.service;

import com.example.backend.dto.AiReviewResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @Value("${GEMINI_API_URL}")
    private String apiUrl;

    public GeminiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate an AI answer for a doubt that has gone unanswered
     * NOTE: Disabled to conserve API quota - returns null (fallback behavior)
     */
    public String generateAnswer(String title, String description, String codeSnippet) {
        log.info("AI answer generation disabled to conserve API quota");
        return null; // Let the system use fallback behavior
    }

    /**
     * Review a community answer and assign scores
     * NOTE: Disabled to conserve API quota - returns default scores
     */
    public AiReviewResult reviewAnswer(String questionTitle, String questionDescription, String answerContent) {
        log.info("AI review disabled to conserve API quota");
        return AiReviewResult.builder()
                .accuracyScore(7)
                .clarityScore(7)
                .codeQualityScore(7)
                .feedback("Thank you for your contribution!")
                .build();
    }

    /**
     * Find similar existing questions based on a title
     * NOTE: Disabled to conserve API quota - returns null
     */
    public String findSimilarQuestions(String title, String description) {
        log.info("Similar questions feature disabled to conserve API quota");
        return null;
    }

    /**
     * Explain a doubt in beginner-friendly terms
     */
    public String explainForBeginner(String title, String description, String codeSnippet) {
        String prompt = """
                You are a patient, friendly programming tutor. Explain this developer question 
                as if talking to a complete beginner. Use simple analogies, avoid jargon, 
                and break down complex concepts step by step.
                
                **Question:** %s
                **Details:** %s
                **Code:**
                ```
                %s
                ```
                
                Explain:
                1. What the question is really asking (in simple terms)
                2. Why this is confusing
                3. A beginner-friendly explanation of the solution
                4. A simple analogy to remember the concept
                
                Use Markdown formatting with emojis for friendliness.
                """.formatted(title, description, codeSnippet != null ? codeSnippet : "N/A");

        return callGemini(prompt);
    }

    /**
     * Infer user skill tags based on their activity
     * NOTE: Disabled to conserve API quota - returns null
     */
    public String inferSkillTags(List<String> doubtTitles, List<String> answerContents) {
        log.info("Skill inference disabled to conserve API quota");
        return null;
    }

    private static final int MAX_RETRIES = 3;
    private static final long BASE_DELAY_MS = 2000;

    private boolean isRateLimited(Exception e) {
        if (e instanceof WebClientResponseException wcre) {
            return wcre.getStatusCode().value() == 429;
        }
        String msg = e.getMessage() != null ? e.getMessage() : "";
        return msg.contains("429") || msg.contains("Too Many Requests")
                || msg.contains("RESOURCE_EXHAUSTED");
    }

    private String callGemini(String prompt) {
        String url = apiUrl + "?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        Exception lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    long delay = BASE_DELAY_MS * (1L << (attempt - 1)); // 2s, 4s
                    log.info("Gemini API retry attempt {} after {}ms delay", attempt + 1, delay);
                    Thread.sleep(delay);
                }

                String response = webClient.post()
                        .uri(url)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .onStatus(HttpStatusCode::isError, resp -> {
                            int status = resp.statusCode().value();
                            return resp.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new WebClientResponseException(
                                            status, "Gemini API error: " + body,
                                            null, null, null)));
                        })
                        .bodyToMono(String.class)
                        .block();

                if (response == null) {
                    lastException = new RuntimeException("Null response from Gemini API");
                    continue;
                }

                // Parse the Gemini response to extract text
                JsonNode root = objectMapper.readTree(response);
                JsonNode candidates = root.get("candidates");
                if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode content = candidates.get(0).get("content");
                    if (content != null) {
                        JsonNode parts = content.get("parts");
                        if (parts != null && parts.isArray() && !parts.isEmpty()) {
                            return parts.get(0).get("text").asText();
                        }
                    }
                }

                return "AI could not generate a response. Please try again.";
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Gemini API retry interrupted");
                return null;
            } catch (Exception e) {
                lastException = e;
                if (isRateLimited(e)) {
                    log.warn("Gemini API rate limited (attempt {}/{}): {}", attempt + 1, MAX_RETRIES, e.getMessage());
                    // continue to retry
                } else {
                    log.error("Gemini API call failed (non-retryable): {}", e.getMessage());
                    return null;
                }
            }
        }

        log.error("Gemini API call failed after {} retries", MAX_RETRIES, lastException);
        return null;
    }

    private String extractJson(String text) {
        // Try to find JSON object in the response
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1);
        }
        // Try JSON array
        start = text.indexOf('[');
        end = text.lastIndexOf(']');
        if (start != -1 && end != -1 && end > start) {
            return text.substring(start, end + 1);
        }
        return text;
    }
}
