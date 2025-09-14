# 📑 Commit Guidelines

Để đảm bảo lịch sử commit rõ ràng, dễ hiểu và nhất quán, tất cả commit bắt buộc phải theo chuẩn dưới đây.

## 🔹 Cấu trúc commit message

<type>(<scope>): <message>

- **<type>**: loại thay đổi (bắt buộc, phải nằm trong danh sách cho phép).

- **<scope>**: phạm vi ảnh hưởng (bắt buộc, viết lowercase, trong ngoặc).

- **<message>**: mô tả ngắn gọn thay đổi (bắt đầu chữ thường, tối đa ~100 ký tự).

## 🔹 Các loại commit được phép (type-enum)

### ## 🔹 Type Ý nghĩa

          feat	    Thêm mới tính năng
          fix	    Sửa lỗi
          docs	    Thay đổi/tạo mới tài liệu
          style	    Thay đổi format, không ảnh hưởng đến logic (vd: space, prettier, eslint)\r
          refactor	Refactor code, không fix bug, không thêm tính năng
          perf	    Cải thiện hiệu năng
          test	    Thêm/sửa test
          chore	    Thay đổi liên quan config, build, dependencies, CI/CD, tool,…

### 🔹 Scope bắt buộc (scope-empty: never)

Scope phải mô tả khu vực ảnh hưởng: ví dụ auth, ui, cart, api, readme, config…

Scope viết lowercase (scope-case: lower-case).

Message (subject)

Bắt đầu bằng chữ thường (add login with google, không phải Add login with google).

Không dùng dạng PascalCase, Start Case, Sentence case, hay UPPERCASE.

Ngắn gọn, súc tích, mô tả chính xác thay đổi.

🔹 Ví dụ hợp lệ ✅

```bash
feat(auth): add login with google
fix(ui): button not clickable on mobile
docs(readme): update installation guide
style(css): adjust button alignment
refactor(cart): simplify item remove logic
```

🔹 Ví dụ không hợp lệ ❌

```bash
feat: add login with google       # Thiếu scope
Fix(UI): Button not clickable     # Type viết hoa + scope viết hoa + message sai case
update: change button color       # Type không nằm trong enum
docs: Update installation guide   # Thiếu scope + message sai case
```

🔹 Checklist trước khi commit

Commit đã qua lint-staged (ESLint + Prettier)

Commit message đúng format <type>(<scope>): <message>

Không quá dài dòng, mỗi commit nên chứa thay đổi liên quan nhau

👉 Với setup Husky + Commitlint, nếu bạn vi phạm rule thì commit sẽ bị chặn.
