package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.*;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.TagRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoubtService {

    private final DoubtRepository doubtRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    @Transactional
    public DoubtResponse createDoubt(CreateDoubtRequest request, String username) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Doubt doubt = Doubt.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .codeSnippet(request.getCodeSnippet())
                .status(DoubtStatus.OPEN)
                .author(author)
                .build();

        // Process tags
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            List<Tag> tags = new ArrayList<>();
            for (String tagName : request.getTags()) {
                String normalizedTag = tagName.toLowerCase().trim();
                Tag tag = tagRepository.findByName(normalizedTag)
                        .orElseGet(() -> tagRepository.save(Tag.builder().name(normalizedTag).build()));
                tag.setUsageCount(tag.getUsageCount() + 1);
                tagRepository.save(tag);
                tags.add(tag);
            }
            doubt.setTags(tags);
        }

        doubt = doubtRepository.save(doubt);
        return mapToResponse(doubt);
    }

    @Transactional(readOnly = true)
    public Page<DoubtResponse> getAllDoubts(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return doubtRepository.findAllWithAuthor(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoubtResponse> searchDoubts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return doubtRepository.searchByQuery(query, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoubtResponse> getDoubtsByTag(String tagName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return doubtRepository.findByTagName(tagName, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoubtResponse> getDoubtsByStatus(DoubtStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return doubtRepository.findByStatus(status, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoubtResponse> getDoubtsByUser(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return doubtRepository.findByAuthorId(userId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public DoubtResponse getDoubtById(String id) {
        Doubt doubt = doubtRepository.findByIdWithAuthorAndAnswers(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", id));
        doubt.setViewCount(doubt.getViewCount() + 1);
        doubtRepository.save(doubt);
        return mapToResponse(doubt);
    }

    @Transactional
    public DoubtResponse updateDoubt(String id, CreateDoubtRequest request, String username) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", id));

        if (!doubt.getAuthor().getUsername().equals(username)) {
            throw new BadRequestException("You can only edit your own doubts");
        }

        doubt.setTitle(request.getTitle());
        doubt.setDescription(request.getDescription());
        doubt.setCodeSnippet(request.getCodeSnippet());

        doubt = doubtRepository.save(doubt);
        return mapToResponse(doubt);
    }

    @Transactional
    public void deleteDoubt(String id, String username, boolean isAdmin) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doubt", "id", id));

        if (!isAdmin && !doubt.getAuthor().getUsername().equals(username)) {
            throw new BadRequestException("You can only delete your own doubts");
        }

        doubtRepository.delete(doubt);
    }

    @Transactional(readOnly = true)
    public List<DoubtResponse> findSimilarDoubts(String title) {
        Pageable pageable = PageRequest.of(0, 5);
        return doubtRepository.findSimilarByTitle(title, pageable).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DoubtResponse mapToResponse(Doubt doubt) {
        return DoubtResponse.builder()
                .id(doubt.getId())
                .title(doubt.getTitle())
                .description(doubt.getDescription())
                .codeSnippet(doubt.getCodeSnippet())
                .status(doubt.getStatus().name())
                .acceptedAnswerId(doubt.getAcceptedAnswerId())
                .viewCount(doubt.getViewCount())
                .tags(doubt.getTags().stream().map(Tag::getName).collect(Collectors.toList()))
                .author(AuthorDto.builder()
                        .id(doubt.getAuthor().getId())
                        .username(doubt.getAuthor().getUsername())
                        .avatarUrl(doubt.getAuthor().getAvatarUrl())
                        .reputationPoints(doubt.getAuthor().getReputationPoints())
                        .build())
                .answerCount(getAnswerCount(doubt))
                .createdAt(doubt.getCreatedAt())
                .updatedAt(doubt.getUpdatedAt())
                .build();
    }

    private int getAnswerCount(Doubt doubt) {
        try {
            return doubt.getAnswers() != null ? doubt.getAnswers().size() : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}
