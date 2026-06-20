package com.library.app.service.impl;

import com.library.app.dto.request.ChangePasswordRequest;
import com.library.app.dto.request.UpdateProfileRequest;
import com.library.app.dto.response.AppResponse.BorrowResponse;
import com.library.app.dto.response.AppResponse.UserProfile;
import com.library.app.entity.BorrowRecord;
import com.library.app.entity.User;
import com.library.app.exception.AppException;
import com.library.app.repository.BorrowRecordRepository;
import com.library.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       BorrowRecordRepository borrowRecordRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfile getProfile(String email) {
        return UserProfile.from(findByEmail(email));
    }

    public UserProfile updateProfile(String email, UpdateProfileRequest req) {
        User user = findByEmail(email);
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setAddress(req.getAddress());
        user.setDateOfBirth(req.getDateOfBirth());
        return UserProfile.from(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest req) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw AppException.badRequest("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public List<BorrowResponse> getCurrentLoans(String email) {
        User user = findByEmail(email);
        return borrowRecordRepository
                .findByUserIdAndStatus(user.getId(), BorrowRecord.BorrowStatus.ACTIVE)
                .stream().map(BorrowResponse::from).collect(Collectors.toList());
    }

    public List<BorrowResponse> getBorrowHistory(String email) {
        User user = findByEmail(email);
        return borrowRecordRepository
                .findByUserIdAndStatusNot(user.getId(), BorrowRecord.BorrowStatus.ACTIVE)
                .stream().map(BorrowResponse::from).collect(Collectors.toList());
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));
    }
}
