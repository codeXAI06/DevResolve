package com.example.backend.service;

import com.example.backend.dto.TagUsageDto;
import com.example.backend.model.Tag;
import com.example.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    public List<TagUsageDto> getTrendingTags(int limit) {
        return tagRepository.findTrending(PageRequest.of(0, limit)).stream()
                .map(tag -> TagUsageDto.builder()
                        .name(tag.getName())
                        .usageCount(tag.getUsageCount())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TagUsageDto> searchTags(String query) {
        return tagRepository.searchByName(query).stream()
                .map(tag -> TagUsageDto.builder()
                        .name(tag.getName())
                        .usageCount(tag.getUsageCount())
                        .build())
                .collect(Collectors.toList());
    }

    public List<TagUsageDto> getAllTags() {
        return tagRepository.findAll().stream()
                .map(tag -> TagUsageDto.builder()
                        .name(tag.getName())
                        .usageCount(tag.getUsageCount())
                        .build())
                .collect(Collectors.toList());
    }
}
