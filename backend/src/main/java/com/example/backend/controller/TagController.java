package com.example.backend.controller;

import com.example.backend.dto.TagUsageDto;
import com.example.backend.dto.DoubtResponse;
import com.example.backend.service.DoubtService;
import com.example.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*",allowedHeaders = "*")
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final DoubtService doubtService;

    @GetMapping
    public ResponseEntity<List<TagUsageDto>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TagUsageDto>> getTrendingTags(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(tagService.getTrendingTags(limit));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TagUsageDto>> searchTags(@RequestParam String q) {
        return ResponseEntity.ok(tagService.searchTags(q));
    }

    @GetMapping("/{name}/doubts")
    public ResponseEntity<Page<DoubtResponse>> getDoubtsByTag(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(doubtService.getDoubtsByTag(name, page, size));
    }
}
