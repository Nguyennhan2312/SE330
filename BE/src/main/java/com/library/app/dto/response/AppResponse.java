package com.library.app.dto.response;

import com.library.app.entity.BorrowRecord;
import com.library.app.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AppResponse {

    // ── ApiResponse<T> ────────────────────────────────────────────────────────
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public ApiResponse() {}
        public ApiResponse(boolean success, String message, T data) {
            this.success = success; this.message = message; this.data = data;
        }

        public static <T> ApiResponse<T> ok(T data) {
            return new ApiResponse<>(true, null, data);
        }
        public static <T> ApiResponse<T> ok(String message, T data) {
            return new ApiResponse<>(true, message, data);
        }
        public static <T> ApiResponse<T> fail(String message) {
            return new ApiResponse<>(false, message, null);
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public T getData() { return data; }
    }

    // ── TokenResponse ─────────────────────────────────────────────────────────
    public static class TokenResponse {
        private String accessToken;
        private String tokenType;
        private long expiresIn;

        public TokenResponse() {}
        public TokenResponse(String accessToken, String tokenType, long expiresIn) {
            this.accessToken = accessToken; this.tokenType = tokenType; this.expiresIn = expiresIn;
        }

        public static TokenResponse of(String accessToken) {
            return new TokenResponse(accessToken, "Bearer", 86400000L);
        }

        public String getAccessToken() { return accessToken; }
        public String getTokenType() { return tokenType; }
        public long getExpiresIn() { return expiresIn; }
    }

    // ── UserProfile ───────────────────────────────────────────────────────────
    public static class UserProfile {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String role;
        private String status;
        private LocalDateTime createdAt;

        public UserProfile() {}

        public static UserProfile from(User user) {
            UserProfile p = new UserProfile();
            p.id = user.getId();
            p.fullName = user.getFullName();
            p.email = user.getEmail();
            p.phone = user.getPhone();
            p.address = user.getAddress();
            p.dateOfBirth = user.getDateOfBirth();
            p.role = user.getRole().name();
            p.status = user.getStatus().name();
            p.createdAt = user.getCreatedAt();
            return p;
        }

        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAddress() { return address; }
        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public String getRole() { return role; }
        public String getStatus() { return status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    // ── BorrowResponse ────────────────────────────────────────────────────────
    public static class BorrowResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String bookAuthor;
        private String barcode;
        private LocalDate borrowedAt;
        private LocalDate dueDate;
        private LocalDate returnedAt;
        private String status;
        private Double fineAmount;

        public BorrowResponse() {}

        public static BorrowResponse from(BorrowRecord r) {
            BorrowResponse b = new BorrowResponse();
            b.id = r.getId();
            b.bookId = r.getBook() != null ? r.getBook().getId() : null;
            b.bookTitle = r.getBookTitle();
            b.bookAuthor = r.getBookAuthor();
            b.barcode = r.getBarcode();
            b.borrowedAt = r.getBorrowedAt();
            b.dueDate = r.getDueDate();
            b.returnedAt = r.getReturnedAt();
            b.status = r.getStatus().name();
            b.fineAmount = r.getFineAmount();
            return b;
        }

        public Long getId() { return id; }
        public Long getBookId() { return bookId; }
        public String getBookTitle() { return bookTitle; }
        public String getBookAuthor() { return bookAuthor; }
        public String getBarcode() { return barcode; }
        public LocalDate getBorrowedAt() { return borrowedAt; }
        public LocalDate getDueDate() { return dueDate; }
        public LocalDate getReturnedAt() { return returnedAt; }
        public String getStatus() { return status; }
        public Double getFineAmount() { return fineAmount; }
    }

    // ── BookResponse ──────────────────────────────────────────────────────────
    public static class BookResponse {
        private Long id;
        private String title;
        private String author;
        private String category;
        private String description;
        private String coverUrl;
        private Integer totalCopies;
        private Integer availableCopies;

        public BookResponse() {}

        public static BookResponse from(com.library.app.entity.Book b) {
            BookResponse r = new BookResponse();
            r.id = b.getId();
            r.title = b.getTitle();
            r.author = b.getAuthor();
            r.category = b.getCategory();
            r.description = b.getDescription();
            r.coverUrl = b.getCoverUrl();
            r.totalCopies = b.getTotalCopies();
            r.availableCopies = b.getAvailableCopies();
            return r;
        }

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getAuthor() { return author; }
        public String getCategory() { return category; }
        public String getDescription() { return description; }
        public String getCoverUrl() { return coverUrl; }
        public Integer getTotalCopies() { return totalCopies; }
        public Integer getAvailableCopies() { return availableCopies; }
    }
}
