# Pivot Table – Q&A xử lý (dùng khi trình bày/bảo vệ báo cáo)

> Tài liệu này là bộ câu hỏi thường gặp và câu trả lời ngắn gọn, bám theo cách hệ thống đang xử lý Pivot Table và Dataset Operation.

---

## 1) Pivot Table lấy dữ liệu từ đâu?

**Hỏi:** Pivot Table lấy dữ liệu từ dataset gốc hay dữ liệu đã xử lý?

**Đáp:** Pivot Table lấy từ **dữ liệu làm việc** sau khi các thao tác trong **Dataset Operation** (lọc/sort/pivot…) được áp dụng. Điều này giúp kết quả pivot bám đúng phạm vi và logic xử lý dữ liệu hiện tại.

---

## 2) Dataset Operation đang gồm những gì?

**Hỏi:** Dataset Operation gồm những nhóm thao tác nào?

**Đáp:** Dataset Operation được chia theo các tab chính:

- **Filter**: lọc dữ liệu theo điều kiện.
- **Sort**: sắp xếp đa cấp.
- **Pivot**: cấu hình pivot (Rows/Columns/Values/Filters).

---

## 3) Thứ tự áp dụng Filter và Pivot là gì?

**Hỏi:** Filter chạy trước hay Pivot chạy trước?

**Đáp:** Khi làm báo cáo, nguyên tắc chuẩn là **lọc phạm vi trước**, rồi mới pivot để tổng hợp. Như vậy:

- Pivot chạy trên tập dữ liệu đã lọc.
- Tăng tốc xử lý và đảm bảo số liệu đúng phạm vi báo cáo.

---

## 4) Rows/Columns/Values/Filters khác nhau thế nào?

**Hỏi:** Ý nghĩa của 4 nhóm cấu hình Pivot là gì?

**Đáp:**

- **Rows**: chiều nhóm chính (đọc theo trục dọc).
- **Columns**: chiều so sánh ngang (tạo bảng chéo).
- **Values**: các chỉ số cần tổng hợp (sum/count/avg…).
- **Filters**: giới hạn phạm vi pivot theo thuộc tính (giống “lọc của pivot”).

---

## 5) Pivot Filters khác gì Filter tab?

**Hỏi:** Pivot Filters khác gì Filter trong tab Filter?

**Đáp:**

- **Filter tab**: lọc dữ liệu _trước khi_ tổng hợp. Tác động trực tiếp lên dataset làm việc.
- **Pivot Filters**: lọc theo logic pivot (định nghĩa những record nào tham gia vào tổng hợp theo cấu hình pivot).

Trong báo cáo, để tránh nhầm, mình luôn nói rõ: “lọc dữ liệu đầu vào” (Filter tab) và “lọc trong pivot” (Pivot filters).

---

## 6) Điều kiện filter chạy theo AND hay OR?

**Hỏi:** Nhiều điều kiện filter được kết hợp như thế nào?

**Đáp:** Theo xử lý hiện tại:

- **AND giữa các cột filter**.
- **AND giữa các conditions trong cùng 1 cột**.
- Logic **OR** được hỗ trợ bằng `equals/not_equals` với **nhiều giá trị** (mảng values).

---

## 7) `equals` / `not_equals` cho Date nghĩa là gì?

**Hỏi:** Với cột kiểu date, `equals` / `not_equals` được hiểu như thế nào?

**Đáp:** Hệ thống so sánh theo **timestamp** sau khi parse:

- `equals`: timestamp của ô dữ liệu **bằng đúng** timestamp của giá trị filter.
- `not_equals`: timestamp của ô dữ liệu **không trùng** với bất kỳ giá trị filter nào.

Lưu ý quan trọng:

- Nếu dữ liệu là **datetime** (có giờ/phút/giây) thì `equals` chỉ match khi timestamp trùng tuyệt đối.
- Hệ thống **không tự normalize về “cùng ngày”** (không tự đưa về đầu ngày).

---

## 8) Date parse dựa trên cái gì?

**Hỏi:** Date được parse dựa trên format nào?

**Đáp:** Date được parse theo `dateFormat` của header (nếu có). Nếu parse fail thì fallback qua các cách phổ biến (ISO/auto-parse). Nếu vẫn fail, hệ thống sẽ coi giá trị là không parse được.

---

## 9) Nếu filter nhập sai (invalid) thì có bị “lọc sạch dữ liệu” không?

**Hỏi:** Khi nhập điều kiện filter sai, hệ thống xử lý thế nào?

**Đáp:** Với nhiều phép so sánh, nếu giá trị so sánh không hợp lệ, hệ thống có xu hướng **bỏ qua điều kiện đó** (coi như pass) để tránh làm rỗng dữ liệu do input lỗi.

---

## 10) `is_empty` / `is_not_empty` định nghĩa thế nào?

**Hỏi:** Một ô được coi là “empty” theo hệ thống là gì?

**Đáp:** `is_empty` true nếu:

- null/undefined
- hoặc chuỗi rỗng
- hoặc chuỗi chỉ có khoảng trắng

`is_not_empty` là ngược lại.

---

## 11) Vì sao sau khi bật Pivot, phần Axis/Series có thể bị reset?

**Hỏi:** Tại sao chọn cột X/Series trước đó nhưng bật pivot xong lại mất?

**Đáp:** Pivot làm thay đổi cấu trúc headers đầu ra. Nếu cấu hình cũ trỏ vào cột không còn tồn tại hoặc không hợp lệ, hệ thống sẽ:

- Auto-config lại nếu có thể.
- Hoặc reset để tránh dùng “cột cũ sai”.

---

## 12) Auto-config sau Pivot hoạt động ra sao?

**Hỏi:** Hệ thống tự chọn X-axis/series sau pivot dựa vào gì?

**Đáp:** Hệ thống có cơ chế auto-config dựa trên headers hiện tại (đã pivot). Nếu tìm được cấu hình hợp lệ, hệ thống cập nhật config; nếu không, hệ thống sẽ clear các lựa chọn X/Series/keys để user chọn lại.

---

## 13) Giới hạn số series tự chọn là gì và vì sao?

**Hỏi:** Vì sao hệ thống không auto-select tất cả series?

**Đáp:** Có giới hạn số series auto-select để tránh biểu đồ quá nặng và khó đọc. Nếu vượt giới hạn, hệ thống cảnh báo và phần còn lại user có thể thêm thủ công.

---

## 14) Pivot Table có thể gây chậm không? Khi nào?

**Hỏi:** Khi nào pivot có thể chậm?

**Đáp:** Pivot có thể chậm khi:

- Dataset lớn
- Rows/Columns tạo quá nhiều tổ hợp (cardinality cao)
- Values nhiều và phức tạp

Cách trình bày khuyến nghị:

- Filter phạm vi trước
- Giới hạn số dimensions
- Tránh Columns tạo quá nhiều cột

---

## 15) Khi nào nên dùng Pivot Table thay vì Chart ngay?

**Hỏi:** Tại sao không vẽ chart luôn mà phải pivot?

**Đáp:** Pivot Table giúp:

- Kiểm tra tính đúng (đối soát) trước
- Xác định chính xác phép tổng hợp
- Làm rõ góc nhìn (rows/columns/filters)

Sau khi pivot đúng, chart chỉ là bước “trình bày trực quan”.

---

## 16) Khi nào `between` phù hợp hơn `equals` cho Date?

**Hỏi:** Nếu muốn lọc “theo ngày” (không quan tâm giờ) thì nên dùng gì?

**Đáp:** Nên dùng điều kiện dạng **range** (`between`) để bao trọn khoảng thời gian của ngày/tháng/năm, vì `equals` so sánh timestamp tuyệt đối và có thể không match nếu data có giờ.

---

## 17) Nếu có nhiều điều kiện trên cùng 1 cột thì hiểu sao?

**Hỏi:** Nhiều condition trên cùng 1 cột filter là OR hay AND?

**Đáp:** Là **AND**. Nếu cần OR, dùng `equals/not_equals` với **mảng giá trị**.

---

## 18) Cách trả lời khi bị hỏi “tại sao ra con số này?”

**Hỏi:** Làm sao giải thích con số trong pivot một cách thuyết phục?

**Đáp:** Trả lời theo 3 bước cố định:

1. **Phạm vi dữ liệu**: Filter tab + Pivot filters đang bật gì.
2. **Nhóm dữ liệu**: Rows/Columns đang nhóm theo trường nào.
3. **Cách tính**: Values đang dùng phép tổng hợp nào.

---

## 19) Câu hỏi về tính nhất quán (reproducibility)

**Hỏi:** Làm sao đảm bảo lần sau mở lại vẫn ra đúng pivot?

**Đáp:** Mình lưu cấu hình (Import/Export) và đảm bảo dataset/cột không đổi id. Khi cấu hình được nạp lại, hệ thống sẽ áp đúng pipeline xử lý.

---

## 20) Câu hỏi về “khác nhau giữa dataset đã pivot và dataset gốc”

**Hỏi:** Pivot có làm mất dữ liệu gốc không?

**Đáp:** Không. Pivot tạo ra “dạng hiển thị/tổng hợp” dựa trên dữ liệu làm việc. Dataset gốc vẫn giữ nguyên; Pivot là lớp cấu hình tổng hợp phục vụ báo cáo.
