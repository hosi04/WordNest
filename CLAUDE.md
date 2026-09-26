# Learn English with Hosi (tên cũ: WordNest)

Web học từ vựng tiếng Anh cho 1 người dùng (mục đích học tập cá nhân). Giao diện tiếng Việt.

## Tài liệu phải đọc
- Đặc tả đầy đủ: `docs/spec.md` (màn hình, chức năng, thuật toán ôn tập, schema database, cách deploy).
- Layout tham khảo: `docs/screens/*.png` — bám sát màu, font, bố cục, khoảng cách.

## Stack
- React + Vite + TypeScript, React Router, Tailwind CSS, lucide-react (icon).
- Supabase (@supabase/supabase-js) cho database + đăng nhập. Database đã được tạo sẵn bằng SQL trong spec — KHÔNG tự đổi schema; cần đổi thì hỏi trước.
- Deploy: Vercel. PWA bằng vite-plugin-pwa.

## Quy tắc code
- Mọi truy cập dữ liệu nằm trong `src/lib/db.ts`; component không gọi supabase trực tiếp.
- Thuật toán ôn tập nằm trong `src/lib/srs.ts`, dùng đúng hàm `review()` trong spec, có unit test (Vitest).
- Key đọc từ `import.meta.env.VITE_SUPABASE_URL` và `import.meta.env.VITE_SUPABASE_ANON_KEY`. Không bao giờ ghi key vào code, không dùng service_role key.
- Ngày tính theo múi giờ `Asia/Ho_Chi_Minh`.
- Màu và font khai báo một lần trong cấu hình Tailwind (theme.extend), không rải mã màu khắp nơi.
- Component nhỏ, đặt tên rõ ràng; tên biến/hàm tiếng Anh.
- Giao diện song ngữ Tiếng Việt / English: mọi chữ hiển thị lấy từ `src/i18n/vi.ts` và `src/i18n/en.ts` qua `useI18n()`, không viết cứng trong component. Viết hoa kiểu câu (chỉ chữ đầu và tên riêng). Nội dung học (nghĩa tiếng Việt, câu dịch) giữ tiếng Việt vì người học là người Việt.
- Nút bấm là `<button>`, liên kết là `<a>`/`<Link>`; nút chỉ có icon phải có `aria-label`.

## Cách làm việc
- Làm theo 6 bước trong mục "Kế hoạch triển khai" của `docs/spec.md`, mỗi lần chỉ một bước.
- Xong mỗi bước: chạy `npm run build` và `npm test` không lỗi, rồi DỪNG LẠI, tóm tắt đã làm gì và hướng dẫn tôi kiểm tra bằng tay.
- Chỗ nào trong spec chưa rõ thì hỏi, đừng tự đoán những quyết định lớn.
