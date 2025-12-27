# Dữ liệu nào dùng chart nào (Mapping nhanh)

Tài liệu này giúp chọn đúng loại chart dựa trên **dạng dữ liệu** và **mục tiêu phân tích**.

---

## 0) Cách chọn nhanh (Decision Tree)

Trước khi chọn chart, hãy trả lời theo thứ tự:

1. Dữ liệu của bạn có **trục thời gian** (date/datetime) không?
   - Có → ưu tiên **Line/Area** (xu hướng) hoặc **Cycle plot** (mùa vụ/chu kỳ).
   - Không → đi tiếp.
2. Bạn đang muốn **so sánh giữa các nhóm** (category) hay **nhìn mối quan hệ giữa 2 biến số**?
   - So sánh nhóm → **Bar**.
   - Mối quan hệ 2 biến số → **Scatter**.
3. Bạn đang muốn trình bày **cơ cấu % trong tổng**?
   - Có → **Pie/Donut** (nếu ít nhóm); nếu nhiều nhóm → **Bar**.
4. Dữ liệu là dạng **ma trận 2 chiều** (2 dimensions) + 1 metric?
   - Có → **Heatmap**.
5. Bạn chỉ có 1 biến số và muốn xem **phân phối**?
   - Có → **Histogram**.

---

## 0.1) Checklist “chuẩn hóa dữ liệu” trước khi vẽ chart

- **[Xác định vai trò cột]**
  - Cột nào là **dimension** (text/date) và cột nào là **metric** (number)?
- **[Đúng kiểu dữ liệu]**
  - Date phải parse được theo format thống nhất.
  - Number không được lẫn ký tự (dấu phẩy, đơn vị, khoảng trắng) nếu cần tính toán.
- **[Giảm độ phức tạp]**
  - Nếu quá nhiều category hoặc quá nhiều điểm thời gian, hãy filter trước.
- **[Tổng hợp trước khi vẽ]**
  - Nếu dữ liệu đang ở level transaction (rất nhiều dòng), hãy dùng Pivot Table/aggregation để tạo bảng tổng hợp trước khi vẽ.

---

## 1) Bảng chọn nhanh theo dạng dữ liệu

### 1.1 Có cột thời gian (date/datetime) + chỉ số số (number)

**Dùng:** Line / Area

- **Line chart**: khi mục tiêu là **xu hướng theo thời gian** (tăng/giảm, biến động, điểm gãy).
- **Area chart**: khi mục tiêu là nhấn mạnh **quy mô/khối lượng tăng giảm** (cảm giác “magnitude” mạnh hơn line).

**Phù hợp để trả lời:**

- “Xu hướng thay đổi theo thời gian như thế nào?”
- “Giai đoạn nào tăng/giảm mạnh?”
- “Có điểm bất thường (spike/dip) không?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 cột thời gian (X)
- 1 hoặc nhiều cột số (Y)

**Khuyến nghị chuẩn bị dữ liệu:**

- Nếu dữ liệu là transaction (nhiều dòng theo thời điểm), hãy Pivot/aggregate về cùng granular (ngày/tháng/quý) trước.
- Nếu là `datetime` nhưng báo cáo theo ngày: nên tổng hợp theo ngày thay vì dùng `equals` theo timestamp.

**Lỗi hay gặp:**

- Trục thời gian không được sort đúng → đường đi “lộn xộn”.
- Quá nhiều điểm (hàng nghìn điểm) → khó đọc; cần filter hoặc gom theo khoảng thời gian.

---

### 1.2 Có cột nhóm (category/text) + chỉ số số (number)

**Dùng:** Bar

- **Bar chart**: khi mục tiêu là **so sánh giữa các nhóm** (top/bottom, ranking rõ ràng).

**Phù hợp để trả lời:**

- “Nhóm nào cao nhất/thấp nhất?”
- “So sánh KPI giữa các nhóm/khu vực/sản phẩm?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 cột category (X)
- 1 cột số (Y)

**Khuyến nghị chuẩn bị dữ liệu:**

- Nếu số nhóm nhiều: lọc top N hoặc gom nhóm nhỏ vào “Others” (nếu nghiệp vụ cho phép).
- Nếu chart dùng để xếp hạng: sort theo giá trị giảm dần.

**Lỗi hay gặp:**

- Nhãn quá dài / quá nhiều nhóm → chồng chữ; cần rút gọn nhãn hoặc filter.

---

### 1.3 Có 2 chỉ số số (number vs number)

**Dùng:** Scatter

- **Scatter chart**: khi mục tiêu là nhìn **mối quan hệ/correlation** giữa 2 biến và phát hiện **outlier**.

**Phù hợp để trả lời:**

- “Hai biến có đi cùng chiều không?”
- “Có cụm dữ liệu (cluster) hay outlier không?”

**Yêu cầu dữ liệu tối thiểu:**

- 2 cột số (X và Y)

**Khuyến nghị chuẩn bị dữ liệu:**

- Loại bỏ hoặc đánh dấu điểm thiếu dữ liệu (null/empty).
- Nếu thang đo quá chênh lệch, cân nhắc chuẩn hóa hoặc dùng log scale (nếu hệ thống hỗ trợ).

**Lỗi hay gặp:**

- Dữ liệu quá dày (overplotting) → khó đọc; cần filter hoặc sampling.

---

### 1.4 Có cơ cấu “phần trong tổng” (part-to-whole)

**Dùng:** Pie / Donut

- **Pie/Donut chart**: khi mục tiêu là trình bày **tỷ trọng (%)** của các nhóm trong tổng.

**Phù hợp để trả lời:**

- “Nhóm nào chiếm tỷ trọng lớn nhất?”
- “Cơ cấu phân bổ như thế nào?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 cột category (label)
- 1 cột số (value)

**Khuyến nghị chuẩn bị dữ liệu:**

- Đảm bảo giá trị (value) là số hợp lệ và tổng có ý nghĩa để tính tỷ trọng.
- Nếu có nhiều nhóm nhỏ, gộp nhóm nhỏ hoặc lọc top nhóm quan trọng để biểu đồ dễ đọc.
- Nếu cần % chính xác theo phạm vi báo cáo, hãy filter dữ liệu trước khi tính tỷ trọng.

**Quy tắc dùng trong báo cáo:**

- Nếu số nhóm quá nhiều và khó đọc, ưu tiên chuyển sang **Bar chart**.

**Lỗi hay gặp:**

- Dùng pie/donut khi có quá nhiều nhóm → không đọc được chênh lệch.
- Các nhóm gần nhau về tỷ trọng → bar chart sẽ thuyết phục hơn.

---

### 1.5 Dữ liệu ma trận 2 chiều (2 dimensions) + 1 chỉ số (metric)

**Dùng:** Heatmap

- **Heatmap**: khi mục tiêu là nhìn nhanh “ô nào mạnh/yếu nhất” theo **2 chiều**.

**Phù hợp để trả lời:**

- “Kết hợp nào đang cao nhất/thấp nhất?”
- “Pattern theo ma trận 2 chiều có rõ không?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 dimension cho trục X (category hoặc time)
- 1 dimension cho trục Y (category)
- 1 metric số để tô màu (intensity)

**Khuyến nghị chuẩn bị dữ liệu:**

- Pivot trước để ra bảng tổng hợp (dimension X, dimension Y, metric).
- Kiểm soát số lượng hàng/cột: heatmap quá lớn sẽ khó đọc.

**Lỗi hay gặp:**

- Thang màu không phù hợp làm “đánh lừa” cảm nhận; cần chọn màu/legend rõ.

---

### 1.6 Một biến số cần xem phân phối (distribution)

**Dùng:** Histogram

- **Histogram**: khi mục tiêu là hiểu **phân phối** (dữ liệu tập trung ở khoảng nào, lệch trái/phải, có đuôi dài, có cực trị…).

**Phù hợp để trả lời:**

- “Giá trị chủ yếu nằm trong khoảng nào?”
- “Có nhiều giá trị bất thường/cực trị không?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 cột số

**Khuyến nghị chuẩn bị dữ liệu:**

- Loại bỏ giá trị không hợp lệ (text lẫn trong number).
- Xem xét xử lý outlier nếu làm sai lệch bins quá mạnh.

---

### 1.7 Dữ liệu có tính chu kỳ/mùa vụ lặp lại

**Dùng:** Cycle plot

- **Cycle plot**: khi mục tiêu là làm rõ **seasonality/chu kỳ** (lặp theo tháng, theo tuần, theo giờ…).

**Phù hợp để trả lời:**

- “Có tính mùa vụ lặp theo chu kỳ không?”
- “Trong mỗi chu kỳ, đoạn nào cao/thấp?”

**Yêu cầu dữ liệu tối thiểu:**

- 1 trường chu kỳ (cycle)
- 1 trường period/thời điểm (period)
- 1 cột số (value)

**Khuyến nghị chuẩn bị dữ liệu:**

- Dữ liệu phải đủ dài để quan sát chu kỳ (tối thiểu vài chu kỳ).
- Thống nhất quy ước cycle/period (ví dụ: cycle = năm, period = tháng) để kết quả nhất quán.
- Nếu dữ liệu là datetime, cần quy về cùng granular (ngày/giờ) trước khi đưa vào cycle plot.

---

## 2) Quy tắc chọn nhanh (1 câu)

- So sánh nhóm → **Bar**
- Xu hướng theo thời gian → **Line/Area**
- Tương quan 2 biến số → **Scatter**
- Cơ cấu % → **Pie/Donut**
- Ma trận 2 chiều + cường độ → **Heatmap**
- Phân phối 1 biến → **Histogram**
- Mùa vụ/chu kỳ → **Cycle plot**

---

## 3) Gợi ý dùng trong báo cáo (Pivot Table → Chart)

- **Pivot Table**: dùng để tổng hợp và đối soát số liệu (Rows/Columns/Values/Filters).
- **Chart**: dùng để trực quan hóa kết quả pivot, giúp người xem nắm insight nhanh.

**Quy tắc thực tế khi trình bày:**

- Nếu báo cáo cần “số liệu đúng” trước → Pivot Table trước.
- Nếu cần “kể câu chuyện xu hướng/so sánh” → chọn chart phù hợp sau khi pivot.
