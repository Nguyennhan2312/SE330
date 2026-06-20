-- ============================================================
--  Library App — PostgreSQL Schema
--  Chạy lần đầu để tạo CSDL (JPA ddl-auto=update tự tạo,
--  nhưng dùng file này để seed dữ liệu mẫu)
-- ============================================================

-- Tạo database (chạy tay trong psql)
-- CREATE DATABASE library_db;

-- ── Bảng users ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(255)        NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password      VARCHAR(255)        NOT NULL,
    phone         VARCHAR(20),
    address       TEXT,
    date_of_birth DATE,
    role          VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Bảng borrow_records ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS borrow_records (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id),
    book_title   VARCHAR(500) NOT NULL,
    book_author  VARCHAR(255),
    barcode      VARCHAR(100),
    borrowed_at  DATE         NOT NULL,
    due_date     DATE,
    returned_at  DATE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    fine_amount  DOUBLE PRECISION,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Dữ liệu mẫu ─────────────────────────────────────────────
-- Mật khẩu mẫu: "password123" (đã hash bằng BCrypt)
INSERT INTO users (full_name, email, password, phone, address, role, status)
VALUES
  ('Nguyễn Văn An',   'an@example.com',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0901234567', 'Hà Nội',    'MEMBER', 'ACTIVE'),
  ('Trần Thị Bình',   'binh@example.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '0912345678', 'HCM',       'MEMBER', 'ACTIVE'),
  ('Lê Văn Admin',    'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', NULL,         NULL,        'ADMIN',  'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Lịch sử mượn mẫu cho user id=1 (an@example.com)
INSERT INTO borrow_records (user_id, book_title, book_author, barcode, borrowed_at, due_date, returned_at, status, fine_amount)
VALUES
  (1, 'Lập trình Java cơ bản',         'Nguyễn Minh',  'BC001', '2025-01-10', '2025-01-24', '2025-01-22', 'RETURNED', NULL),
  (1, 'Spring Boot in Action',          'Craig Walls',  'BC002', '2025-02-01', '2025-02-15', '2025-02-20', 'RETURNED', 15000),
  (1, 'Clean Code',                     'Robert Martin','BC003', '2025-03-05', '2025-03-19', NULL,         'ACTIVE',   NULL),
  (1, 'Design Patterns',                'GoF',          'BC004', '2025-04-01', '2025-04-15', NULL,         'OVERDUE',  30000),
  (2, 'Cơ sở dữ liệu nâng cao',        'Trần Văn Hùng','BC005', '2025-03-10', '2025-03-24', '2025-03-23', 'RETURNED', NULL)
ON CONFLICT DO NOTHING;

-- ── Bảng books ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(500) NOT NULL,
    author            VARCHAR(255),
    category          VARCHAR(100),
    description       TEXT,
    cover_url         VARCHAR(500),
    total_copies      INT NOT NULL DEFAULT 1,
    available_copies  INT NOT NULL DEFAULT 1,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Thêm cột book_id vào borrow_records nếu chưa có
ALTER TABLE borrow_records ADD COLUMN IF NOT EXISTS book_id BIGINT REFERENCES books(id);

-- ── Dữ liệu sách mẫu ────────────────────────────────────────
INSERT INTO books (title, author, category, description, total_copies, available_copies) VALUES
('Clean Code', 'Robert C. Martin', 'Lập trình', 'Hướng dẫn viết code sạch, dễ đọc và bảo trì, dành cho lập trình viên chuyên nghiệp.', 3, 3),
('The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 'Lập trình', 'Cuốn sách kinh điển về tư duy và kỹ năng của lập trình viên thực dụng.', 2, 2),
('Design Patterns', 'Gang of Four', 'Lập trình', '23 mẫu thiết kế phần mềm kinh điển giúp giải quyết các vấn đề lập trình phổ biến.', 2, 2),
('Spring Boot in Action', 'Craig Walls', 'Java', 'Hướng dẫn toàn diện về phát triển ứng dụng với Spring Boot từ cơ bản đến nâng cao.', 3, 3),
('Học JavaScript qua ví dụ', 'Nguyễn Văn Hùng', 'Lập trình Web', 'Giáo trình JavaScript thực hành với hơn 100 ví dụ minh họa chi tiết.', 2, 2),
('Cơ sở dữ liệu', 'Trần Thị Mai', 'Cơ sở dữ liệu', 'Giáo trình cơ sở dữ liệu quan hệ, SQL và thiết kế database cho sinh viên.', 4, 4),
('Trí tuệ nhân tạo', 'Stuart Russell', 'AI', 'Tổng quan về trí tuệ nhân tạo, machine learning và ứng dụng thực tiễn.', 2, 2),
('Nhà giả kim', 'Paulo Coelho', 'Văn học', 'Câu chuyện hành trình tìm kiếm kho báu và khám phá bản thân của chàng trai trẻ Santiago.', 5, 5),
('Đắc nhân tâm', 'Dale Carnegie', 'Kỹ năng sống', 'Cuốn sách về nghệ thuật giao tiếp và ứng xử đã thay đổi cuộc đời hàng triệu người.', 4, 4),
('Sapiens: Lược sử loài người', 'Yuval Noah Harari', 'Lịch sử', 'Hành trình 70.000 năm của loài người từ thời tiền sử đến thế giới hiện đại.', 3, 3)
ON CONFLICT DO NOTHING;
