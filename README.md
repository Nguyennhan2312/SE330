# Library App — Quản lý hồ sơ độc giả

## Cấu trúc project

```
Project/
├── BE/   → Java Spring Boot + Spring Security + JWT + PostgreSQL
└── FE/   → Next.js 14 + TypeScript + Tailwind CSS
```

## Thứ tự chạy

1. **Tạo database**: `CREATE DATABASE library_db;`
2. **Seed data**: `psql -U postgres -d library_db -f BE/src/main/resources/schema.sql`
3. **Chạy BE**: `cd BE && mvn spring-boot:run` → `http://localhost:8080`
4. **Chạy FE**: `cd FE && npm install && npm run dev` → `http://localhost:3000`

## Tính năng

- Đăng ký tài khoản (không cần xác minh email)
- Đăng nhập → nhận JWT
- Xem & chỉnh sửa thông tin cá nhân (họ tên, SĐT, địa chỉ, ngày sinh)
- Đổi mật khẩu
- Xem sách đang mượn
- Xem lịch sử mượn sách

## Tài khoản demo

| Email | Mật khẩu | Role |
|---|---|---|
| an@example.com | password123 | MEMBER |
| binh@example.com | password123 | MEMBER |
| admin@example.com | password123 | ADMIN |
