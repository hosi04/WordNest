# Việc để làm sau

- [ ] **Tra từ dự phòng:** Free Dictionary API (`api.dictionaryapi.dev`) hay sập (522 / timeout). Thêm fallback sang Wiktionary REST (`https://en.wiktionary.org/api/rest_v1/page/definition/<word>`, có CORS) khi Free Dictionary lỗi hoặc quá ~5 giây. Wiktionary không có IPA và từ đồng nghĩa; định nghĩa trả về dạng HTML cần lọc thẻ. Sửa trong `src/lib/dictionary.ts` + thêm test.
- [ ] **Từ `squidry`** trong danh sách của người dùng chưa rõ là từ gì (squid? sundry?) — hỏi lại rồi thêm vào bộ "Giao tiếp hằng ngày".
- [ ] **Bundle > 500 kB:** tách code theo route (`React.lazy`) để giảm cảnh báo khi build.
- [x] **Rà soát chính tả & viết hoa toàn bộ website:** đã làm cùng lúc với việc tách chữ sang `src/i18n/vi.ts` / `en.ts` (sentence case, ví dụ "Về Tổng quan" → "Về trang tổng quan"). Chữ mới thêm vào phải đi qua hai file này.
