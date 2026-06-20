package com.library.app.controller;

import com.library.app.dto.response.AppResponse.ApiResponse;
import com.library.app.dto.response.AppResponse.BookResponse;
import com.library.app.dto.response.AppResponse.BorrowResponse;
import com.library.app.service.impl.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /** GET /api/books — danh sách tất cả sách */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookResponse>>> getAllBooks() {
        return ResponseEntity.ok(ApiResponse.ok(bookService.getAllBooks()));
    }

    /** POST /api/books/{id}/borrow — mượn sách */
    @PostMapping("/{id}/borrow")
    public ResponseEntity<ApiResponse<BorrowResponse>> borrowBook(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BorrowResponse record = bookService.borrowBook(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Mượn sách thành công", record));
    }

    /** POST /api/borrows/{id}/return — trả sách */
    @PostMapping("/borrows/{id}/return")
    public ResponseEntity<ApiResponse<BorrowResponse>> returnBook(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BorrowResponse record = bookService.returnBook(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Trả sách thành công", record));
    }
}
