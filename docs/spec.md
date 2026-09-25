# WordNest — Đặc tả

## 1. Tổng quan

WordNest là web học từ vựng tiếng Anh cho **một người dùng** (mục đích học tập cá nhân), chạy miễn phí trên Vercel với dữ liệu lưu ở Supabase để đồng bộ giữa máy tính và điện thoại.

| Hạng mục | Lựa chọn |
| --- | --- |
| Frontend | React + Vite + TypeScript, React Router |
| Giao diện | Tailwind CSS; font Fraunces (tiêu đề) + Be Vietnam Pro (nội dung); icon lucide-react |
| Dữ liệu & đăng nhập | Supabase (Postgres + Auth, đăng nhập bằng email magic link hoặc Google) |
| Hosting | Vercel (gói Hobby miễn phí), tự deploy khi push lên GitHub |
| Phát âm | Web Speech API của trình duyệt (`speechSynthesis`, giọng en-US) |
| Tra từ tự động | Free Dictionary API (`https://api.dictionaryapi.dev/api/v2/entries/en/<word>`) để lấy IPA, định nghĩa, ví dụ tiếng Anh |
| Cài lên điện thoại | PWA (vite-plugin-pwa) |

Không làm trong bản đầu: nhiều người dùng, bảng xếp hạng, thanh toán, app native.

### Thiết kế

| Token | Giá trị |
| --- | --- |
| Nền trang | `#F6F1E7` |
| Nền thẻ | `#FFFDF8` |
| Viền | `#E7DFCF` |
| Nền phụ (chip, thanh tiến độ rỗng) | `#F0EADD` |
| Chữ chính | `#1E2A3A` (cũng là nền menu trái) |
| Chữ phụ | `#5A6270` |
| Nhấn (nút chính) | `#C2461F`, hover `#9E3616`, nền nhạt `#FBE3D6` |
| Xanh lá (đúng / đã thuộc) | `#2F7D5B`, nền nhạt `#DDEFE4` |
| Xanh dương (phát âm / mới) | `#2F5E9E`, nền nhạt `#E0E9F6` |
| Vàng (chuỗi ngày / XP) | `#F2C14E`, nền nhạt `#FCF0CF` |
| Bo góc | 10–12px cho nút/ô nhập, 16–20px cho thẻ, 28px cho flashcard lớn |
| Font | Fraunces 600 cho tiêu đề và từ tiếng Anh lớn; Be Vietnam Pro 400/500/600/700 cho nội dung |

Desktop: menu trái rộng 240px nền `#1E2A3A` (Tổng quan, Học thẻ, Kiểm tra, Sổ từ vựng, Thống kê) + ô chuỗi ngày ở đáy menu. Dưới 768px: menu trái đổi thành thanh điều hướng dưới đáy màn hình. Nút cao tối thiểu 44px.

## 2. Màn hình và chức năng

| Màn hình | Đường dẫn | Chức năng cần có |
| --- | --- | --- |
| Đăng nhập | `/login` | Nhập email → nhận magic link, hoặc nút Đăng nhập Google |
| Tổng quan | `/` | 4 chỉ số (chuỗi ngày, từ đã thuộc, từ cần ôn hôm nay, độ chính xác 7 ngày); khối Ôn tập hôm nay (số thẻ đến hạn + nút Bắt đầu ôn + nút Học từ mới); Từ của ngày (chọn ngẫu nhiên từ thẻ Mới, cố định trong ngày); danh sách bộ từ kèm % đã thuộc; biểu đồ cột số lượt ôn 7 ngày (hôm nay tô màu nhấn) |
| Học thẻ | `/study` và `/study/:deckId` | Lấy các thẻ đến hạn, sau đó thêm tối đa `new_per_day` thẻ mới; bấm thẻ hoặc phím Space để lật; mặt trước: từ, từ loại, cấp độ, IPA; mặt sau: nghĩa tiếng Việt, định nghĩa tiếng Anh, câu ví dụ + dịch; 4 nút Quên / Khó / Nhớ / Dễ (phím 1–4) hiện khoảng cách ôn tiếp; nút loa phát âm; thanh tiến độ X / Tổng; màn hình hoàn thành khi hết thẻ |
| Kiểm tra | `/quiz` | 10 câu trắc nghiệm chọn nghĩa đúng; 3 đáp án nhiễu lấy ngẫu nhiên từ nghĩa của từ khác; hiện câu ví dụ; chọn xong hiện đúng/sai (xanh/cam) và giải thích; câu sai được đưa về ôn ngay (`due_at = now()`); thanh tiến độ 10 ô; tổng kết điểm cuối bài |
| Sổ từ vựng | `/words` | Tìm kiếm; lọc Tất cả / Mới / Đang học / Đã thuộc (kèm số lượng); bảng từ (từ + IPA, nghĩa, cấp độ, trạng thái, ôn lần tới); khung chi tiết bên phải (nghĩa, ví dụ, đồng nghĩa, mức ghi nhớ, nút Ôn từ này / Sửa); thêm / sửa / xóa từ |
| Thêm/sửa từ | hộp thoại trên `/words` | Gõ từ tiếng Anh → tự điền IPA, từ loại, định nghĩa, ví dụ từ Free Dictionary API; người dùng tự nhập nghĩa tiếng Việt; chọn bộ từ và cấp độ A1–C2; báo trùng nếu từ đã có |
| Cài đặt | `/settings` | Số từ mới mỗi ngày; quản lý bộ từ (thêm/sửa/xóa, chọn màu); nhập từ file CSV; xuất toàn bộ dữ liệu ra JSON để sao lưu; đăng xuất |

Quy tắc trạng thái thẻ:
- **Mới** = chưa ôn lần nào (`last_reviewed_at is null`).
- **Đã thuộc** = `interval_days >= 21`.
- Còn lại là **Đang học**.

Chuỗi ngày: tăng khi trong ngày (giờ Việt Nam) có ít nhất 1 lượt ôn; bỏ một ngày thì về 0.
Mức ghi nhớ 1–5 trong khung chi tiết: suy ra từ `interval_days` (0 → 1, 1–2 → 2, 3–7 → 3, 8–20 → 4, ≥21 → 5).

File CSV nhập từ có các cột: `word,meaning_vi,part_of_speech,level,example_en,example_vi`.

## 3. Lặp lại ngắt quãng

Dùng bản rút gọn của thuật toán SM-2 (giống Anki). Mỗi thẻ lưu `ease` (mặc định 2.5), `interval_days`, `reps`, `due_at`.

| Nút | Thẻ mới (reps = 0) | Thẻ đã ôn | Thay đổi ease |
| --- | --- | --- | --- |
| Quên (1) | ôn lại sau 1 phút | reps về 0, ôn lại sau 1 phút | −0.20 |
| Khó (2) | ôn lại sau 6 phút | interval × 1.2 | −0.15 |
| Nhớ (3) | 1 ngày | interval × ease | không đổi |
| Dễ (4) | 4 ngày | interval × ease × 1.3 | +0.15 |

`ease` không thấp hơn 1.3. Khoảng cách làm tròn và tối thiểu 1 ngày với thẻ đã ôn. Viết thành hàm thuần trong `src/lib/srs.ts`:

```ts
export type Rating = 1 | 2 | 3 | 4;
export interface SrsState { ease: number; interval_days: number; reps: number; }

const MIN = 60_000, DAY = 86_400_000;

export function review(s: SrsState, r: Rating, now = Date.now()) {
  let { ease, interval_days, reps } = s;
  let dueMs: number;
  if (r === 1) {
    ease = Math.max(1.3, ease - 0.2); reps = 0; interval_days = 0; dueMs = now + MIN;
  } else if (r === 2) {
    ease = Math.max(1.3, ease - 0.15);
    if (reps === 0) { dueMs = now + 6 * MIN; }
    else { interval_days = Math.max(1, Math.round(interval_days * 1.2)); reps++; dueMs = now + interval_days * DAY; }
  } else {
    if (r === 4) ease += 0.15;
    if (reps === 0) interval_days = r === 4 ? 4 : 1;
    else interval_days = Math.max(1, Math.round(interval_days * ease * (r === 4 ? 1.3 : 1)));
    reps++; dueMs = now + interval_days * DAY;
  }
  return { ease, interval_days, reps, due_at: new Date(dueMs).toISOString() };
}
```

Trên nút đánh giá, hiển thị khoảng cách bằng cách gọi thử `review()` với từng mức rồi đổi ra "< 1 phút", "6 phút", "1 ngày", "4 ngày"…

## 4. Cơ sở dữ liệu Supabase

Đã được tạo sẵn bằng đoạn SQL dưới đây (chạy trong SQL Editor của Supabase). Mọi bảng có `user_id` và bật Row Level Security.

| Bảng | Lưu gì |
| --- | --- |
| `decks` | Bộ từ: tên, màu, mô tả |
| `words` | Mỗi từ là một thẻ: nội dung từ + trạng thái ôn tập |
| `reviews` | Nhật ký từng lượt ôn/kiểm tra (thống kê, chuỗi ngày, độ chính xác) |
| `settings` | Cài đặt cá nhân: số từ mới/ngày, múi giờ |

```sql
create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  color text default '#C2461F',
  description text,
  created_at timestamptz default now()
);

create table words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  deck_id uuid references decks on delete set null,
  word text not null,
  ipa text,
  part_of_speech text,
  level text check (level in ('A1','A2','B1','B2','C1','C2')),
  meaning_vi text not null,
  definition_en text,
  examples jsonb default '[]',      -- [{"en": "...", "vi": "..."}]
  synonyms text[] default '{}',
  ease real not null default 2.5,
  interval_days int not null default 0,
  reps int not null default 0,
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, word)
);
create index on words (user_id, due_at);

create table reviews (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  word_id uuid not null references words on delete cascade,
  mode text not null check (mode in ('flashcard','quiz')),
  rating smallint,                  -- 1-4 cho flashcard
  correct boolean,                  -- cho quiz
  reviewed_at timestamptz not null default now()
);
create index on reviews (user_id, reviewed_at);

create table settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  new_per_day int not null default 10,
  timezone text not null default 'Asia/Ho_Chi_Minh'
);

alter table decks    enable row level security;
alter table words    enable row level security;
alter table reviews  enable row level security;
alter table settings enable row level security;

create policy "own decks"    on decks    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own words"    on words    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reviews"  on reviews  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own settings" on settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Truy vấn chính:
- Thẻ đến hạn: `last_reviewed_at is not null and due_at <= now()`.
- Thẻ mới: `last_reviewed_at is null`, giới hạn `new_per_day`.
- Mỗi lần ôn: cập nhật `words` bằng kết quả `review()`, gán `last_reviewed_at = now()`, thêm 1 dòng vào `reviews`.
- Biểu đồ tuần: đếm `reviews` theo ngày (giờ Việt Nam) trong 7 ngày gần nhất.
- Nếu chưa có dòng `settings` thì tạo với giá trị mặc định (upsert).

## 5. Deploy

- Biến môi trường: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (trong `.env.local` khi chạy máy, và trong Vercel > Environment Variables).
- Thêm `vercel.json` rewrite mọi đường dẫn về `/index.html` để reload trang con không lỗi 404:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- Supabase > Authentication > URL Configuration: Site URL = link Vercel; thêm `http://localhost:5173` vào Redirect URLs để chạy thử trên máy.

## 6. Kế hoạch triển khai

Làm lần lượt, dừng sau mỗi bước để kiểm tra:

1. Khởi tạo project, Tailwind (khai báo màu/font), React Router, layout khung + menu (desktop và mobile), đăng nhập Supabase, bảo vệ route. Thêm `vercel.json`.
2. Sổ từ vựng: thêm / sửa / xóa / tìm / lọc, hộp thoại thêm từ có tự điền từ Free Dictionary API. Khi DB trống, tạo sẵn bộ mẫu "Giao tiếp hằng ngày" 20 từ.
3. Học flashcard + `src/lib/srs.ts` (kèm unit test cho `review()`), phím tắt Space và 1–4, phát âm.
4. Kiểm tra trắc nghiệm.
5. Trang Tổng quan với số liệu thật.
6. Cài đặt: số từ mới/ngày, quản lý bộ từ, nhập CSV, xuất JSON; PWA (icon, manifest, cài lên màn hình chính).
