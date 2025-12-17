# Hướng dẫn sử dụng tính năng Phân tích Tương quan

## Giới thiệu

Tính năng **Phân tích Tương quan** giúp bạn hiểu mối quan hệ giữa các trường dữ liệu số trong dataset. Tính năng này tự động phát hiện các cột chứa dữ liệu số và tính toán hệ số tương quan giữa chúng.

## Cách sử dụng

### 1. Khi tạo Dataset mới

1. Tải lên file CSV/Excel hoặc nhập dữ liệu
2. Nhấn vào tab **"Phân tích tương quan"** ở trên bảng dữ liệu
3. Chọn loại phân tích phù hợp từ dropdown:
   - **Pearson**: Cho dữ liệu có quan hệ tuyến tính
   - **Spearman**: Cho dữ liệu không tuyến tính
   - **Kendall Tau**: Cho dataset nhỏ, nhiều giá trị trùng lặp

### 2. Khi xem Dataset đã tạo

1. Mở Dataset Detail Page
2. Ở phần "Data Preview", chuyển sang tab **"Phân tích tương quan"**
3. Chọn loại phân tích và xem kết quả

## Đọc hiểu Ma trận Tương quan

### Màu sắc

- **Xanh đậm**: Tương quan dương mạnh (+0.7 → +1)
- **Xanh nhạt**: Tương quan dương trung bình (+0.3 → +0.7)
- **Xám**: Tương quan yếu hoặc không có (0 → ±0.3)
- **Đỏ nhạt**: Tương quan âm trung bình (-0.3 → -0.7)
- **Đỏ đậm**: Tương quan âm mạnh (-0.7 → -1)

### Giá trị

- **+1**: X tăng → Y tăng (hoàn hảo)
- **0**: Không có mối liên hệ
- **-1**: X tăng → Y giảm (hoàn hảo)

## Tính năng

✅ Tự động phát hiện cột số  
✅ 3 loại correlation: Pearson, Spearman, Kendall  
✅ Hiển thị ma trận dạng heatmap với màu sắc trực quan  
✅ Click vào ô để xem chi tiết tương quan  
✅ Xuất ma trận ra file CSV  
✅ Chú giải và hướng dẫn đầy đủ

## Ví dụ thực tế

**Tương quan dương (+)**

- Số giờ học ↔ Điểm thi
- Chiều cao ↔ Cân nặng
- Ngân sách marketing ↔ Doanh thu

**Tương quan âm (-)**

- Giá sản phẩm ↔ Số lượng bán
- Tuổi xe ↔ Giá trị xe
- Nhiệt độ ↔ Chi phí sưởi ấm

**Không tương quan (0)**

- Chiều cao ↔ Điểm toán
- Màu tóc ↔ Thu nhập
- Ngày sinh ↔ IQ

## ⚠️ Lưu ý quan trọng

**Tương quan KHÔNG phải là nhân quả!**

Chỉ vì hai biến có tương quan cao không có nghĩa là biến này gây ra biến kia.

**Ví dụ:**

- Tiêu thụ kem và số vụ đuối nước có tương quan cao
- Nhưng kem không gây đuối nước
- Cả hai đều tăng vào mùa hè (biến ẩn)

## Khi nào dùng loại Correlation nào?

### Pearson

✅ Dữ liệu số liên tục  
✅ Quan hệ tuyến tính  
✅ Ít outliers  
❌ Dữ liệu thứ hạng

### Spearman

✅ Quan hệ không tuyến tính  
✅ Có nhiều outliers  
✅ Dữ liệu thứ hạng  
❌ Dataset rất lớn

### Kendall Tau

✅ Dataset nhỏ (< 30 mẫu)  
✅ Nhiều giá trị trùng lặp  
✅ Đo mức độ đồng thuận  
❌ Dataset lớn (chậm)

## Xuất dữ liệu

Nhấn nút **"Xuất CSV"** để tải ma trận tương quan về máy. File CSV có thể mở bằng Excel hoặc công cụ phân tích khác.

## Xử lý lỗi

**"Không đủ dữ liệu số để phân tích"**

- Dataset cần có ít nhất 2 cột chứa dữ liệu số
- Kiểm tra lại định dạng dữ liệu của bạn

**Giá trị NaN hoặc null**

- Hệ thống tự động bỏ qua các giá trị rỗng
- Đảm bảo mỗi cột có ít nhất 2 giá trị hợp lệ

## Tài liệu chi tiết

Xem [CORRELATION_ANALYSIS_FEATURE.md](./CORRELATION_ANALYSIS_FEATURE.md) để biết thêm chi tiết kỹ thuật.
