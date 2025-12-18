# Correlation Analysis Feature

## Tổng quan

Tính năng phân tích tương quan (Correlation Analysis) cho phép người dùng phân tích mức độ liên quan giữa các trường dữ liệu số trong dataset. Tính năng này hỗ trợ 3 loại correlation coefficient phổ biến: Pearson, Spearman, và Kendall Tau.

## Các thành phần

### 1. Correlation Utilities (`src/utils/correlationUtils.ts`)

#### Các hàm chính:

**`calculatePearsonCorrelation(x: number[], y: number[]): CorrelationResult`**

- Tính hệ số tương quan Pearson
- Phù hợp với: dữ liệu liên tục, quan hệ tuyến tính, phân phối chuẩn
- Công thức: r = cov(X, Y) / (σX · σY)

**`calculateSpearmanCorrelation(x: number[], y: number[]): CorrelationResult`**

- Tính hệ số tương quan Spearman rank
- Phù hợp với: quan hệ không tuyến tính, dữ liệu thứ hạng, không phân phối chuẩn
- Sử dụng rank thay vì giá trị gốc

**`calculateKendallTauCorrelation(x: number[], y: number[]): CorrelationResult`**

- Tính hệ số tương quan Kendall Tau
- Phù hợp với: dataset nhỏ, nhiều giá trị trùng lặp
- Đếm số cặp concordant và discordant

**`calculateCorrelationMatrix(data: Record<string, number[]>, type): CorrelationMatrix`**

- Tạo ma trận tương quan cho nhiều biến
- Trả về ma trận symmetric n×n với n là số biến

**`extractNumericColumns(headers, data): Record<string, number[]>`**

- Trích xuất các cột chứa dữ liệu số từ dataset
- Tự động lọc bỏ các giá trị null/empty
- Chỉ giữ lại cột có ít nhất 2 giá trị hợp lệ

**`interpretCorrelation(coefficient: number)`**

- Phân loại mức độ tương quan
- Trả về cả strength (yếu/trung bình/mạnh) và description (tiếng Việt)

**Helper functions:**

- `getCorrelationColor(value)`: Trả về màu cho heatmap (xanh = dương, đỏ = âm)
- `getCorrelationTextColor(value)`: Trả về màu text phù hợp với background

### 2. Correlation Analysis Component (`src/components/dataset/CorrelationAnalysis.tsx`)

#### Props:

```typescript
interface CorrelationAnalysisProps {
  headers: { name: string }[];
  data: (string | number | null)[][];
  className?: string;
}
```

#### Tính năng:

1. **Dropdown lựa chọn loại correlation:**
   - Pearson
   - Spearman
   - Kendall Tau

2. **Hiển thị ma trận correlation dưới dạng heatmap:**
   - Màu sắc thể hiện mức độ tương quan (xanh = dương, đỏ = âm)
   - Giá trị hiển thị với 2 chữ số thập phân
   - Hover để xem giá trị chính xác (4 chữ số thập phân)
   - Click vào ô để xem chi tiết

3. **Chi tiết tương quan khi chọn một ô:**
   - Tên 2 biến
   - Hệ số tương quan (4 chữ số thập phân)
   - Mô tả mức độ tương quan (tiếng Việt)

4. **Export correlation matrix ra CSV:**
   - Button "Xuất CSV" ở góc trên
   - File format: header row + data rows với giá trị 4 chữ số thập phân

5. **Chú giải màu sắc:**
   - Mạnh dương: +0.7 → +1 (xanh đậm)
   - Trung bình dương: +0.3 → +0.7 (xanh nhạt)
   - Yếu/Không: 0 → ±0.3 (xám)
   - Trung bình âm: -0.3 → -0.7 (đỏ nhạt)
   - Mạnh âm: -0.7 → -1 (đỏ đậm)

6. **Warning box:**
   - Nhắc nhở: Tương quan ≠ Quan hệ nhân quả

## Tích hợp vào UI

### 1. CreateDatasetPage (trong DataViewer)

File: `src/components/dataset/DataViewer.tsx`

- Thêm tabs "Dữ liệu" và "Phân tích tương quan"
- Tab "Phân tích tương quan" hiển thị `CorrelationAnalysis` component
- Tự động lấy data từ `currentParsedData` của DatasetContext

### 2. DatasetDetailPage (trong DatasetPreviewCard)

File: `src/components/dataset/DatasetPreviewCard.tsx`

- Thêm tabs "Dữ liệu" và "Phân tích tương quan"
- Tab "Dữ liệu": Hiển thị bảng dữ liệu (DatasetViewerTable)
- Tab "Phân tích tương quan": Hiển thị ma trận correlation

## Cách sử dụng

### Khi tạo dataset mới:

1. Upload file CSV/Excel hoặc nhập dữ liệu
2. Chuyển sang tab "Phân tích tương quan"
3. Chọn loại correlation phù hợp:
   - **Pearson**: Nếu dữ liệu có quan hệ tuyến tính
   - **Spearman**: Nếu quan hệ không tuyến tính hoặc có nhiều outliers
   - **Kendall Tau**: Nếu dataset nhỏ hoặc có nhiều giá trị trùng lặp
4. Xem ma trận tương quan
5. Click vào từng ô để xem chi tiết
6. Export CSV nếu cần

### Khi xem dataset đã tạo:

1. Vào Dataset Detail Page
2. Ở phần "Data Preview", chuyển sang tab "Phân tích tương quan"
3. Các bước tương tự như trên

## Xử lý Edge Cases

1. **Không có cột số:**
   - Hiển thị thông báo: "Không đủ dữ liệu số để phân tích tương quan"

2. **Chỉ có 1 cột số:**
   - Hiển thị thông báo: "Cần ít nhất 2 cột chứa dữ liệu số"

3. **Cột có standard deviation = 0 (giá trị constant):**
   - Trả về correlation = 0

4. **Dữ liệu có null/empty values:**
   - Tự động skip các giá trị null/empty khi tính toán

5. **Array khác độ dài:**
   - Throw error với message rõ ràng

## Interpretation Guide

### Hệ số tương quan (Correlation Coefficient)

| Giá trị      | Mức độ            | Ý nghĩa                     |
| ------------ | ----------------- | --------------------------- |
| +1           | Perfect Positive  | Tương quan dương hoàn hảo   |
| +0.7 to +0.9 | Strong Positive   | Tương quan dương mạnh       |
| +0.3 to +0.6 | Moderate Positive | Tương quan dương trung bình |
| 0 to +0.3    | Weak Positive     | Tương quan dương yếu        |
| 0            | No Correlation    | Không có tương quan         |
| 0 to -0.3    | Weak Negative     | Tương quan âm yếu           |
| -0.3 to -0.6 | Moderate Negative | Tương quan âm trung bình    |
| -0.7 to -0.9 | Strong Negative   | Tương quan âm mạnh          |
| -1           | Perfect Negative  | Tương quan âm hoàn hảo      |

### Khi nào dùng loại correlation nào?

**Pearson:**

- ✅ Dữ liệu liên tục (continuous)
- ✅ Quan hệ tuyến tính
- ✅ Ít outliers
- ✅ Phân phối gần chuẩn
- ❌ Dữ liệu thứ hạng
- ❌ Quan hệ phi tuyến

**Spearman:**

- ✅ Quan hệ monotonic (không nhất thiết tuyến tính)
- ✅ Dữ liệu thứ hạng/ordinal
- ✅ Có outliers
- ✅ Không phân phối chuẩn
- ❌ Quan hệ không monotonic

**Kendall Tau:**

- ✅ Dataset nhỏ (< 30 samples)
- ✅ Nhiều giá trị trùng lặp (ties)
- ✅ Đo mức độ đồng thuận
- ✅ Robust với outliers
- ❌ Dataset rất lớn (tính toán chậm)

## Ví dụ thực tế

### Ví dụ 1: Tương quan dương mạnh (Pearson)

- **Biến X**: Số giờ học
- **Biến Y**: Điểm thi
- **Kỳ vọng**: r ≈ +0.8 (học nhiều → điểm cao)

### Ví dụ 2: Tương quan âm mạnh (Pearson)

- **Biến X**: Giá sản phẩm
- **Biến Y**: Số lượng bán
- **Kỳ vọng**: r ≈ -0.7 (giá cao → bán ít)

### Ví dụ 3: Không tương quan

- **Biến X**: Chiều cao
- **Biến Y**: Điểm toán
- **Kỳ vọng**: r ≈ 0 (không liên quan)

## Lưu ý quan trọng

⚠️ **Correlation ≠ Causation**

Hệ số tương quan cao không có nghĩa là một biến gây ra biến kia!

Ví dụ:

- Tiêu thụ kem và số vụ đuối nước có thcorrelation cao
- Nhưng kem KHÔNG gây đuối nước
- Nguyên nhân thật: Cả hai đều tăng vào mùa hè

## Testing

Để test tính năng:

1. Tạo dataset với ít nhất 2 cột số
2. Thử các loại correlation khác nhau
3. Verify kết quả bằng cách so sánh với công cụ thống kê khác (Excel, Python)
4. Test edge cases: null values, constant columns, single numeric column
5. Test export CSV

## Performance

- Ma trận n×n với n cột số
- Độ phức tạp:
  - Pearson: O(n²m) với m là số rows
  - Spearman: O(n²m log m) (do sorting)
  - Kendall: O(n²m²) (chậm nhất)
- Recommendation: Dùng Kendall chỉ khi dataset < 1000 rows

## Future Enhancements

1. Thêm visualization scatter plot cho từng cặp biến
2. P-value và statistical significance test
3. Partial correlation
4. Support cho categorical variables (Point-biserial, Phi coefficient)
5. Clustering dựa trên correlation matrix
6. Heatmap có thể zoom và pan
