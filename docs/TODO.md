# Việc để làm sau

- [x] **Tra từ dự phòng:** Free Dictionary lỗi/chậm quá 5 giây thì tự chuyển sang Wiktionary (`src/lib/dictionary.ts`, có test).
- [ ] **Từ `squidry`** trong danh sách của người dùng chưa rõ là từ gì (squid? sundry?) — hỏi lại rồi thêm vào bộ "Giao tiếp hằng ngày".
- [x] **Bundle > 500 kB:** tách trang bằng `React.lazy` + tách React/Supabase thành chunk riêng; file chính còn ~72 kB.
- [x] **Rà soát chính tả & viết hoa toàn bộ website:** đã làm cùng lúc với việc tách chữ sang `src/i18n/vi.ts` / `en.ts` (sentence case, ví dụ "Về Tổng quan" → "Về trang tổng quan"). Chữ mới thêm vào phải đi qua hai file này.
