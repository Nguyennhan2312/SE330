package com.library.app.controller;

import com.library.app.dto.request.AdminUpdateUserRequest;
import com.library.app.dto.response.AppResponse.ApiResponse;
import com.library.app.dto.response.AppResponse.BorrowResponse;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.service.impl.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** GET /api/admin/users — danh sách tất cả user */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfile>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAllUsers()));
    }

    /** GET /api/admin/users/{id} — chi tiết 1 user */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfile>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUserById(id)));
    }

    /** PUT /api/admin/users/{id} — cập nhật thông tin user */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfile>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", adminService.updateUser(id, req)));
    }

    /** DELETE /api/admin/users/{id} — xóa user */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa tài khoản thành công", null));
    }

    /** GET /api/admin/users/{id}/loans — sách đang mượn của user */
    @GetMapping("/users/{id}/loans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getUserLoans(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUserLoans(id)));
    }

    /** GET /api/admin/users/{id}/loans/history — lịch sử mượn của user */
    @GetMapping("/users/{id}/loans/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getUserLoanHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUserLoanHistory(id)));
    }
}
// thêm vào cuối class (trước dấu } cuối)
