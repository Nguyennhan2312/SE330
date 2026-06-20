package com.library.app.controller;

import com.library.app.dto.request.ChangePasswordRequest;
import com.library.app.dto.request.UpdateProfileRequest;
import com.library.app.dto.response.AppResponse.ApiResponse;
import com.library.app.dto.response.AppResponse.BorrowResponse;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.service.impl.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(userDetails.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                userService.updateProfile(userDetails.getUsername(), req)));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(userDetails.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/me/loans")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getCurrentLoans(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getCurrentLoans(userDetails.getUsername())));
    }

    @GetMapping("/me/loans/history")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getBorrowHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getBorrowHistory(userDetails.getUsername())));
    }
}
