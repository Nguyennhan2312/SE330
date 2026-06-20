# Library App — Frontend (Next.js)

## Tech stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Context API (AuthContext), JWT lưu sessionStorage

## Cài đặt & chạy

```bash
npm install
npm run dev
```
FE chạy tại: `http://localhost:3000`

## Cấu hình kết nối BE

Tạo file `.env.local` (đã có sẵn mẫu):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Các trang

| Route | Mô tả |
|---|---|
| `/login` | Đăng nhập → chuyển về `/profile` |
| `/register` | Đăng ký → chuyển về `/login` (không cần xác minh email) |
| `/profile` | Hồ sơ cá nhân (4 tab) |

### Tab trong `/profile`

| Tab | API gọi |
|---|---|
| Thông tin cá nhân | `GET /api/users/me`, `PUT /api/users/me` |
| Đổi mật khẩu | `PATCH /api/users/me/password` |
| Đang mượn | `GET /api/users/me/loans` |
| Lịch sử mượn | `GET /api/users/me/loans/history` |

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── login/           # Trang đăng nhập
│   ├── register/        # Trang đăng ký
│   └── profile/         # Hồ sơ cá nhân
├── features/
│   ├── auth/
│   │   ├── components/  # LoginForm, RegisterFlow, ProfilePanel
│   │   ├── context/     # AuthContext
│   │   ├── services/    # authService.ts
│   │   └── types/       # auth.type.ts
│   ├── circulation/
│   │   ├── services/    # circulationService.ts
│   │   └── types/       # circulation.type.ts
│   └── i18n/            # EN/VI
└── components/
    └── layout/          # Navbar, Footer
```
