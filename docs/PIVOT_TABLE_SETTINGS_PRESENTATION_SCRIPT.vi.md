# Kịch bản trình bày Settings (vai trò người dùng) – Tập trung Pivot Table

> Mục tiêu: trình bày rõ ràng luồng thao tác Settings để tạo Pivot Table, kiểm soát dữ liệu, và xuất kết quả phục vụ báo cáo.

---

## 1) Mở đầu (00:00–00:30)

**Lời nói (người dùng trình bày):**

Hôm nay mình sẽ trình bày phần **Settings** khi làm báo cáo phân tích dữ liệu. Trọng tâm là **Pivot Table** vì Pivot Table giúp mình tổng hợp dữ liệu theo nhiều chiều (hàng/cột), tính toán chỉ số (sum/count/average…), và lọc đúng phạm vi trước khi đưa vào báo cáo.

---

## 2) Chọn dataset và xác nhận dữ liệu đầu vào (00:30–01:30)

**Lời nói:**

Bước đầu tiên, mình chọn dataset để hệ thống nạp danh sách cột dữ liệu. Khi dataset đã được chọn, mình đảm bảo các cột quan trọng đã xuất hiện trong danh sách và kiểu dữ liệu đúng (text/number/date) để Pivot Table tổng hợp chính xác.

**Thao tác (người dùng làm):**

- Mở khu vực chọn dataset.
- Chọn dataset cần báo cáo.
- Quan sát danh sách cột (headers) đã sẵn sàng để cấu hình.

---

## 3) Làm rõ vai trò “Settings” trước khi Pivot (01:30–02:00)

**Lời nói:**

Trong sidebar Settings, mình sẽ đi theo đúng thứ tự:

- **Basic Settings**: cấu hình thông tin cơ bản.
- **Dataset Operation**: thao tác dữ liệu (nếu cần) trước khi tổng hợp.
- **Pivot Table Settings**: cấu hình Rows/Columns/Values/Filters.
- **Formatter Settings**: định dạng số/ngày/hiển thị.
- **Import/Export**: xuất cấu hình hoặc dữ liệu theo nhu cầu.

---

## 4) Bật Pivot Table và trình bày cấu hình cốt lõi (02:00–06:30)

> Phần này là trọng tâm. Mình trình bày theo đúng 4 khối: **Rows → Columns → Values → Filters**.

### 4.1 Rows – xác định chiều phân tích chính (02:00–03:00)

**Lời nói:**

Ở phần **Rows**, mình chọn các trường đại diện cho “chiều phân tích chính” của báo cáo. Rows quyết định cách dữ liệu được nhóm theo tầng, giúp mình đọc kết quả từ trên xuống.

**Thao tác:**

- Mở cấu hình Pivot Table.
- Thêm các trường cần đưa vào Rows theo đúng cấu trúc báo cáo.
- Sắp xếp thứ tự Rows để đảm bảo kết quả hiển thị đúng cấp độ ưu tiên.

### 4.2 Columns – tạo chiều so sánh ngang (03:00–04:00)

**Lời nói:**

Tiếp theo, ở **Columns**, mình chọn trường dùng để so sánh theo chiều ngang. Columns giúp Pivot Table tạo bảng chéo (cross-tab) và làm nổi bật sự khác biệt giữa các nhóm.

**Thao tác:**

- Thêm trường cần đưa vào Columns.
- Kiểm tra số lượng cột tạo ra để đảm bảo bảng không bị quá rộng.

### 4.3 Values – chỉ số và phép tính (04:00–05:30)

**Lời nói:**

Ở phần **Values**, mình chọn các chỉ số cần tính và chọn đúng phép tính. Đây là nơi quyết định “con số cuối cùng” xuất hiện trong báo cáo.

**Thao tác:**

- Thêm trường dữ liệu vào Values.
- Chọn hàm tổng hợp phù hợp (ví dụ: Sum, Count, Average) theo đúng mục tiêu báo cáo.
- Nếu có nhiều chỉ số, mình đảm bảo tên hiển thị rõ ràng để người xem hiểu ngay.

### 4.4 Filters – giới hạn phạm vi báo cáo (05:30–06:30)

**Lời nói:**

Cuối cùng, phần **Filters** dùng để giới hạn phạm vi dữ liệu theo đúng nội dung báo cáo. Filters giúp mình loại bỏ nhiễu và đảm bảo số liệu tập trung đúng đối tượng cần trình bày.

**Thao tác:**

- Thêm các trường filter.
- Chọn giá trị filter đúng phạm vi báo cáo.
- Xác nhận lại tổng số dòng/tổng giá trị sau khi filter để đảm bảo kết quả hợp lý.

---

## 5) Kiểm tra kết quả Pivot Table theo checklist (06:30–08:00)

**Lời nói:**

Sau khi cấu hình xong, mình kiểm tra Pivot Table theo checklist để đảm bảo số liệu đúng và trình bày được ngay.

**Checklist kiểm tra (đọc to khi trình bày):**

- Rows/Columns đã đúng thứ tự ưu tiên và đúng góc nhìn.
- Values đang dùng đúng phép tính.
- Không có ô trống bất thường do sai kiểu dữ liệu.
- Tổng số liệu hợp lý so với kỳ vọng.
- Filters đang giới hạn đúng phạm vi báo cáo.

---

## 6) Formatter Settings – chuẩn hoá hiển thị cho báo cáo (08:00–09:00)

**Lời nói:**

Trước khi xuất kết quả, mình dùng **Formatter Settings** để chuẩn hoá cách hiển thị: định dạng số, phần thập phân, dấu phân tách hàng nghìn, hoặc định dạng ngày. Mục tiêu là người xem đọc nhanh và không nhầm lẫn.

**Thao tác:**

- Mở Formatter Settings.
- Chọn định dạng cho trục/giá trị tương ứng.
- Kiểm tra lại Pivot Table sau khi format để đảm bảo không bị thay đổi ý nghĩa dữ liệu.

---

## 7) Import/Export – phục vụ quy trình báo cáo (09:00–10:00)

**Lời nói:**

Ở bước cuối, mình dùng **Import/Export** để lưu hoặc chia sẻ cấu hình. Điều này giúp mình tái sử dụng cấu hình Pivot Table cho các kỳ báo cáo sau mà không cần thiết lập lại từ đầu.

**Thao tác:**

- Mở Import/Export.
- Thực hiện xuất cấu hình hoặc dữ liệu theo nhu cầu.
- Xác nhận file xuất ra đúng nội dung và có thể dùng lại.

---

## 8) Kết thúc (10:00–10:30)

**Lời nói:**

Tóm lại, Pivot Table là phần quan trọng nhất trong Settings vì nó quyết định cách dữ liệu được tổng hợp và lọc theo đúng câu chuyện báo cáo. Quy trình chuẩn của mình là: chọn dataset → thao tác dữ liệu (nếu cần) → cấu hình Rows/Columns/Values/Filters → chuẩn hoá format → xuất cấu hình/kết quả để dùng trong báo cáo.
