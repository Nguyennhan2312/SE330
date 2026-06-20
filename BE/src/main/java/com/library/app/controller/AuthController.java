package com.library.app.controller;

import com.library.app.dto.request.AuthRequest;
import com.library.app.dto.response.AppResponse.ApiResponse;
import com.library.app.dto.response.AppResponse.TokenResponse;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.service.impl.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserProfile>> register(@Valid @RequestBody AuthRequest.Register req) {
        UserProfile profile = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký thành công", profile));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody AuthRequest.Login req) {
        TokenResponse token = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", token));
    }
}
