# Thuyết trình: Tổng quan xử lý của AI Chat Box (ý chính)

## Slide 1 — AI Chat Box là gì?

- **AI Chat Box** là kênh hội thoại trong ứng dụng giúp người dùng tương tác bằng ngôn ngữ tự nhiên.
- Mục tiêu chính:
  - Hỗ trợ người dùng **hiểu dữ liệu**.
  - Hỗ trợ **tạo biểu đồ/báo cáo nhanh hơn**.
  - Đưa ra **gợi ý hành động** thay vì chỉ trả lời văn bản.

## Slide 2 — AI Chat Box giải quyết vấn đề gì?

- Người dùng không cần nhớ hết các bước cấu hình.
- Giảm thời gian “mò” setting:
  - Chọn chart type
  - Chọn cột (X/Y/series)
  - Lọc/sắp xếp/pivot dữ liệu
- Giảm lỗi thao tác nhờ AI nhắc:
  - Chưa chọn dataset
  - Chọn sai kiểu dữ liệu
  - Thiếu cột bắt buộc

## Slide 3 — Luồng xử lý tổng quát (End-to-End)

- **1) Người dùng nhập câu hỏi**
  - FE lưu message và hiển thị ngay trong luồng chat.
- **2) Kiểm tra ngữ cảnh dữ liệu (dataset context)**
  - Nếu chưa có dataset: yêu cầu chọn dataset.
  - Nếu đã có dataset: chuẩn bị context (datasetId, headers, metadata nếu có).
- **3) Gửi request lên backend AI**
  - Gồm: câu hỏi + context + (tuỳ) lịch sử hội thoại.
- **4) Backend xử lý và trả response**
  - Có thể trả: text + intent (đề xuất hành động) + cấu hình gợi ý.
- **5) FE hiển thị + kích hoạt hành động**
  - Render message AI.
  - Hiển thị nút thao tác nhanh hoặc tự apply (tuỳ thiết kế).

## Slide 4 — Dữ liệu đầu vào quan trọng để AI trả lời đúng

- **Nội dung câu hỏi**: nhu cầu phân tích, mục tiêu biểu đồ.
- **Dataset đang chọn**:
  - `datasetId`, `datasetName`
  - Danh sách cột (headers)
  - Thông tin kiểu dữ liệu (nếu hệ thống có)
- **Lịch sử hội thoại**:
  - Giúp AI hiểu ngữ cảnh liên tục (follow-up questions).

## Slide 5 — Những dạng output AI thường trả về

- **Text answer**:
  - Giải thích, hướng dẫn thao tác.
  - Tư vấn chart phù hợp.
- **Suggestion/Intent** (gợi ý hành động):
  - “Tạo biểu đồ cột theo tháng”
  - “Đổi trục X sang cột Date”
  - “Thêm filter/nhóm dữ liệu”
- **Cấu hình gợi ý**:
  - Chart type
  - Mapping field (X/Y/series)
  - Một số tuỳ chọn hiển thị

## Slide 6 — Vai trò của FE trong AI Chat Box

- **Quản lý state hội thoại**:
  - Danh sách tin nhắn, loại tin nhắn, loading/error.
- **Trải nghiệm người dùng**:
  - Quick prompts (câu hỏi gợi ý 1-click).
  - Hiển thị rõ “AI đang xử lý…”.
  - Fallback khi lỗi.
- **Kết nối workflow tạo chart**:
  - Lấy dataset context.
  - Hiển thị suggestion và cho phép apply.

## Slide 7 — Điểm tích hợp quan trọng với hệ thống

- **Dataset Selection**
  - Nếu chưa có dataset, chat cần hướng người dùng chọn dataset trước.
- **Chart Editor / Chart Config**
  - Khi AI đề xuất cấu hình, FE có thể map vào state cấu hình chart.
- **Tour/Onboarding (nếu có)**
  - Dẫn người dùng mới làm quen với tính năng.

## Slide 8 — Lợi ích & kết luận

- **Nhanh hơn**: giảm thao tác thủ công.
- **Đúng hơn**: hạn chế chọn sai cột/sai loại biểu đồ.
- **Dễ dùng hơn**: dùng ngôn ngữ tự nhiên thay cho nhiều bước cấu hình.
- Kết luận: AI Chat Box = **Hội thoại + Ngữ cảnh dữ liệu + Gợi ý hành động**.
