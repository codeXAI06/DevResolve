package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.AnswerRepository;
import com.example.backend.repository.DoubtRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.UserSkillTagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoubtRepository doubtRepository;
    private final AnswerRepository answerRepository;
    private final UserSkillTagRepository skillTagRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .reputationPoints(0)
                .build();

        user = userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToProfile(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(mapToProfile(user))
                .build();
    }

    public UserProfileResponse getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return mapToProfile(user);
    }

    private UserProfileResponse mapToProfile(User user) {
        long doubtsCount = doubtRepository.findByAuthorId(user.getId(), org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long answersCount = answerRepository.countByAuthorId(user.getId());
        long acceptedCount = answerRepository.countByAuthorIdAndAccepted(user.getId(), true);

        var skills = skillTagRepository.findByUserId(user.getId()).stream()
                .map(s -> SkillTagDto.builder().tagName(s.getTagName()).proficiencyScore(s.getProficiencyScore()).build())
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .role(user.getRole().name())
                .reputationPoints(user.getReputationPoints())
                .banned(user.isBanned())
                .createdAt(user.getCreatedAt())
                .doubtsCount(doubtsCount)
                .answersCount(answersCount)
                .acceptedAnswersCount(acceptedCount)
                .skillTags(skills)
                .build();
    }
}
