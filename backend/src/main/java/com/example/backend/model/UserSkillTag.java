package com.example.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_skill_tags")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillTag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String tagName;

    @Builder.Default
    private double proficiencyScore = 0.0;
}
