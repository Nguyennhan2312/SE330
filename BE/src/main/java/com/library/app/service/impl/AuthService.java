package com.library.app.service.impl;

import com.library.app.dto.request.AuthRequest;
import com.library.app.dto.response.AppResponse.TokenResponse;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.entity.User;
import com.library.app.exception.AppException;
import com.library.app.repository.UserRepository;
import com.library.app.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public UserProfile register(AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw AppException.conflict("Email này đã được đăng ký");
        }
        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .build();
        return UserProfile.from(userRepository.save(user));
    }

    public TokenResponse login(AuthRequest.Login req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        String token = jwtUtil.generateToken(req.getEmail());
        return TokenResponse.of(token);
    }
}
