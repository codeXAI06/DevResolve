package com.example.backend.service;

import com.example.backend.dto.AnswerResponse;
import com.example.backend.dto.AuthorDto;
import com.example.backend.dto.CreateAnswerRequest;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Answer;
import com.example.backend.model.Doubt;
import com.example.backend.model.DoubtStatus;
import com.example.backend.model.User;
import com.example.backend.repository.AnswerRepository;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final DoubtRepository doubtRepository;
    private final UserRepository userRepository;
    private final PointsService pointsService;

    @Transactional
    public AnswerResponse createAnswer(String doubtId, CreateAnswerRequest request, String username) {
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", doubtId));

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Answer answer = Answer.builder()
                .content(request.getContent())
                .codeSnippet(request.getCodeSnippet())
                .doubt(doubt)
                .author(author)
                .build();

        answer = answerRepository.save(answer);

        // Update doubt status
        if (doubt.getStatus() == DoubtStatus.OPEN) {
            doubt.setStatus(DoubtStatus.ANSWERED);
            doubtRepository.save(doubt);
        }

        return mapToResponse(answer);
    }

    @Transactional(readOnly = true)
    public Page<AnswerResponse> getAnswersByDoubt(String doubtId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return answerRepository.findByDoubtIdOrderByAcceptedDescCreatedAtAsc(doubtId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public AnswerResponse acceptAnswer(String answerId, String username) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer", "id", answerId));

        Doubt doubt = answer.getDoubt();
        if (!doubt.getAuthor().getUsername().equals(username)) {
            throw new BadRequestException("Only the doubt owner can accept answers");
        }

        // Unaccept previous answer if any
        if (doubt.getAcceptedAnswerId() != null) {
            answerRepository.findById(doubt.getAcceptedAnswerId())
                    .ifPresent(prev -> {
                        prev.setAccepted(false);
                        answerRepository.save(prev);
                    });
        }

        answer.setAccepted(true);
        answerRepository.save(answer);

        doubt.setAcceptedAnswerId(answer.getId());
        doubt.setStatus(DoubtStatus.CLOSED);
        doubtRepository.save(doubt);

        // Award points
        pointsService.awardPoints(answer.getAuthor().getId(), 20, "Answer accepted");

        return mapToResponse(answer);
    }

    @Transactional
    public void updateAiScores(String answerId, int accuracy, int clarity, int codeQuality) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResourceNotFoundException("Answer", "id", answerId));

        answer.setAccuracyScore(accuracy);
        answer.setClarityScore(clarity);
        answer.setCodeQualityScore(codeQuality);
        answerRepository.save(answer);

        // Award bonus points for high AI rating
        double avgScore = (accuracy + clarity + codeQuality) / 3.0;
        if (avgScore > 8) {
            pointsService.awardPoints(answer.getAuthor().getId(), 10, "High AI rating (>" + avgScore + ")");
        }
    }

    public AnswerResponse mapToResponse(Answer answer) {
        return AnswerResponse.builder()
                .id(answer.getId())
                .content(answer.getContent())
                .codeSnippet(answer.getCodeSnippet())
                .doubtId(answer.getDoubt().getId())
                .author(AuthorDto.builder()
                        .id(answer.getAuthor().getId())
                        .username(answer.getAuthor().getUsername())
                        .avatarUrl(answer.getAuthor().getAvatarUrl())
                        .reputationPoints(answer.getAuthor().getReputationPoints())
                        .build())
                .accepted(answer.isAccepted())
                .aiGenerated(answer.isAiGenerated())
                .accuracyScore(answer.getAccuracyScore())
                .clarityScore(answer.getClarityScore())
                .codeQualityScore(answer.getCodeQualityScore())
                .upvotes(answer.getUpvotes())
                .downvotes(answer.getDownvotes())
                .createdAt(answer.getCreatedAt())
                .build();
    }
}
