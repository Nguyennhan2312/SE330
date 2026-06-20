# Library App — Backend (Spring Boot)

## Tech stack
- Java 17, Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11)
- Spring Data JPA + PostgreSQL
- Lombok, Validation

## Cài đặt & chạy

### 1. Tạo database PostgreSQL
```sql
CREATE DATABASE library_db;
```

### 2. Chạy schema + dữ liệu mẫu
```bash
psql -U postgres -d library_db -f src/main/resources/schema.sql
```

### 3. Cấu hình kết nối (nếu cần đổi user/pass)
Sửa file `src/main/resources/application.properties`:
```properties
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 4. Build & run
```bash
mvn spring-boot:run
```
Server chạy tại: `http://localhost:8080`

---

## API Endpoints

### Auth (public)
| Method | URL | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT |

### User (cần Bearer token)
| Method | URL | Mô tả |
|---|---|---|
| GET | `/api/users/me` | Lấy thông tin cá nhân |
| PUT | `/api/users/me` | Cập nhật thông tin cá nhân |
| PATCH | `/api/users/me/password` | Đổi mật khẩu |
| GET | `/api/users/me/loans` | Sách đang mượn |
| GET | `/api/users/me/loans/history` | Lịch sử mượn sách |

---

## Ví dụ request

### Đăng ký
```json
POST /api/auth/register
{
  "fullName": "Nguyễn Văn An",
  "email": "an@example.com",
  "password": "password123",
  "phone": "0901234567"
}
```

### Đăng nhập
```json
POST /api/auth/login
{
  "email": "an@example.com",
  "password": "password123"
}
```
→ Trả về `accessToken`, dùng cho header: `Authorization: Bearer <token>`

### Cập nhật profile
```json
PUT /api/users/me
Authorization: Bearer <token>
{
  "fullName": "Nguyễn Văn An",
  "phone": "0909999999",
  "address": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "dateOfBirth": "2000-05-15"
}
```

### Đổi mật khẩu
```json
PATCH /api/users/me/password
Authorization: Bearer <token>
{
  "oldPassword": "password123",
  "newPassword": "newpass456"
}
```

---

## Cấu trúc thư mục

```
src/main/java/com/library/app/
├── config/          # SecurityConfig, CORS
├── controller/      # AuthController, UserController
├── dto/
│   ├── request/     # AuthRequest, UpdateProfileRequest, ChangePasswordRequest
│   └── response/    # AppResponse (ApiResponse, UserProfile, BorrowResponse, TokenResponse)
├── entity/          # User, BorrowRecord
├── exception/       # AppException, GlobalExceptionHandler
├── repository/      # UserRepository, BorrowRecordRepository
├── security/        # JwtAuthFilter, UserDetailsServiceImpl
├── service/impl/    # AuthService, UserService
└── util/            # JwtUtil
```

## Tài khoản demo (sau khi chạy schema.sql)
| Email | Mật khẩu | Role |
|---|---|---|
| an@example.com | password123 | MEMBER |
| binh@example.com | password123 | MEMBER |
| admin@example.com | password123 | ADMIN |
