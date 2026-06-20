package com.library.app.service.impl;

import com.library.app.dto.response.AppResponse.BookResponse;
import com.library.app.dto.response.AppResponse.BorrowResponse;
import com.library.app.entity.Book;
import com.library.app.entity.BorrowRecord;
import com.library.app.entity.User;
import com.library.app.exception.AppException;
import com.library.app.repository.BookRepository;
import com.library.app.repository.BorrowRecordRepository;
import com.library.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private static final int MAX_BORROW_LIMIT = 5;
    private static final int BORROW_DAYS = 14;

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;

    public BookService(BookRepository bookRepository,
                       BorrowRecordRepository borrowRecordRepository,
                       UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.userRepository = userRepository;
    }

    /** Lấy toàn bộ sách */
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(BookResponse::from)
                .collect(Collectors.toList());
    }

    /** Mượn sách */
    @Transactional
    public BorrowResponse borrowBook(Long bookId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy sách"));

        // Kiểm tra số sách đang mượn
        long currentLoans = borrowRecordRepository
                .findByUserIdAndStatus(user.getId(), BorrowRecord.BorrowStatus.ACTIVE).size();
        if (currentLoans >= MAX_BORROW_LIMIT) {
            throw AppException.badRequest("Bạn đã mượn tối đa " + MAX_BORROW_LIMIT + " cuốn sách");
        }

        // Kiểm tra còn sách không
        if (book.getAvailableCopies() <= 0) {
            throw AppException.badRequest("Sách này hiện không còn bản sao nào");
        }

        // Kiểm tra đã mượn cuốn này chưa
        boolean alreadyBorrowed = borrowRecordRepository
                .findByUserIdAndStatus(user.getId(), BorrowRecord.BorrowStatus.ACTIVE)
                .stream()
                .anyMatch(r -> r.getBook() != null && r.getBook().getId().equals(bookId));
        if (alreadyBorrowed) {
            throw AppException.badRequest("Bạn đang mượn cuốn sách này rồi");
        }

        // Giảm số bản sao
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Tạo bản ghi mượn
        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setBookTitle(book.getTitle());
        record.setBookAuthor(book.getAuthor());
        record.setBorrowedAt(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(BORROW_DAYS));
        record.setStatus(BorrowRecord.BorrowStatus.ACTIVE);

        return BorrowResponse.from(borrowRecordRepository.save(record));
    }

    /** Trả sách */
    @Transactional
    public BorrowResponse returnBook(Long borrowId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy người dùng"));

        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> AppException.notFound("Không tìm thấy bản ghi mượn"));

        if (!record.getUser().getId().equals(user.getId())) {
            throw AppException.badRequest("Bạn không có quyền trả sách này");
        }

        if (record.getStatus() != BorrowRecord.BorrowStatus.ACTIVE) {
            throw AppException.badRequest("Sách này đã được trả trước đó");
        }

        // Cập nhật bản ghi
        record.setReturnedAt(LocalDate.now());
        record.setStatus(BorrowRecord.BorrowStatus.RETURNED);

        // Hoàn lại số bản sao
        if (record.getBook() != null) {
            Book book = record.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }

        return BorrowResponse.from(borrowRecordRepository.save(record));
    }
}
