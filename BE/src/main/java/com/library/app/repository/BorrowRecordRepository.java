package com.library.app.repository;

import com.library.app.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    // Sách đang mượn (chưa trả)
    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowRecord.BorrowStatus status);

    // Lịch sử (đã trả / quá hạn / mất)
    List<BorrowRecord> findByUserIdAndStatusNot(Long userId, BorrowRecord.BorrowStatus status);

    // Tất cả bản ghi của user
    List<BorrowRecord> findByUserId(Long userId);
}
