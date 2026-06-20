package com.library.app.service.impl;

import com.library.app.dto.request.AdminUpdateUserRequest;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.entity.User;
import com.library.app.exception.AppException;
import com.library.app.repository.BorrowRecordRepository;
import com.library.app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public AdminService(UserRepository userRepository, BorrowRecordRepository borrowRecordRepository) {
        this.userRepository = userRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    public List<UserProfile> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserProfile::from)
                .collect(Collectors.toList());
    }

    public UserProfile getUserById(Long id) {
        return UserProfile.from(findById(id));
    }

    public UserProfile updateUser(Long id, AdminUpdateUserRequest req) {
        User user = findById(id);
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        user.setDateOfBirth(req.getDateOfBirth());

        if (req.getRole() != null) {
            try {
                user.setRole(User.Role.valueOf(req.getRole()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (req.getStatus() != null) {
            try {
                user.setStatus(User.UserStatus.valueOf(req.getStatus()));
            } catch (IllegalArgumentException ignored) {}
        }

        return UserProfile.from(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw AppException.notFound("Không tìm thấy người dùng");
        }
        // Xóa lịch sử mượn sách trước để tránh lỗi khóa ngoại
        borrowRecordRepository.deleteAll(borrowRecordRepository.findByUserId(id));
        userRepository.deleteById(id);
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));
    }
}
