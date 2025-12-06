# AI Cleaning Progress Feature

## Tổng quan

Tính năng này cho phép người dùng theo dõi realtime tiến trình làm sạch dữ liệu bằng AI. Progress bar sẽ hiển thị ở góc dưới bên phải màn hình, tương tự như notification của Google Drive.

## Cơ chế hoạt động

### Backend

- Khi người dùng submit CSV hoặc Excel file để clean, backend sẽ:
  1. Tạo một `jobId` và trả về cho FE
  2. Xử lý dữ liệu theo chunks
  3. Sau mỗi chunk hoàn thành, backend bắn WebSocket notification với type `clean-dataset-progress`
  4. Khi hoàn tất tất cả chunks, backend bắn notification với type `clean-dataset-done`

### Frontend

#### 1. Hook: `useAiCleaningProgress`

**Location**: `src/features/ai/useAiCleaningProgress.ts`

Hook này quản lý:

- Kết nối WebSocket với namespace `/user-notification`
- Listen các event:
  - `clean-dataset-progress`: Cập nhật progress bar
  - `clean-dataset-done`: Đánh dấu job hoàn thành
  - `clean-dataset-error`: Xử lý lỗi
- Quản lý danh sách active jobs

**API:**

```typescript
const {
  activeJobs, // Danh sách jobs đang chạy
  addJob, // Thêm job mới vào tracker
  removeJob, // Xóa job khỏi danh sách
  handleJobClick, // Xử lý khi click vào job đã hoàn thành
} = useAiCleaningProgress(userId);
```

#### 2. Component: `AiCleaningProgressBar`

**Location**: `src/components/dataset/AiCleaningProgressBar.tsx`

Component này hiển thị:

- Progress bar với animation smooth
- File name và type (CSV/Excel)
- Status: Processing / Done / Error
- Số chunks đã hoàn thành / tổng số chunks
- Button "Xem kết quả" khi hoàn tất

**Props:**

```typescript
interface AiCleaningProgressBarProps {
  jobs: CleaningJob[];
  onJobClick: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}
```

#### 3. Integration trong `CreateDatasetPage`

```typescript
// Initialize hook
const { activeJobs, addJob, removeJob, handleJobClick } = useAiCleaningProgress(user?.id);

// Truyền callback vào CleanDatasetWithAI
<CleanDatasetWithAI
  onJobSubmit={(jobId, fileName, type) => {
    addJob({ jobId, fileName, type });
  }}
/>

// Render progress bar
<AiCleaningProgressBar
  jobs={activeJobs}
  onJobClick={(jobId) => {
    handleJobClick(jobId, handleCleanDatasetComplete, onError);
  }}
  onRemove={removeJob}
/>
```

## WebSocket Events

### Event: `notification:created`

**Type**: `clean-dataset-progress`

```json
{
  "type": "clean-dataset-progress",
  "jobId": "uuid-string",
  "completed": 5,
  "total": 10,
  "fileName": "data.csv",
  "jobType": "csv"
}
```

**Type**: `clean-dataset-done`

```json
{
  "type": "clean-dataset-done",
  "jobId": "uuid-string",
  "time": "2025-12-03T10:30:00Z"
}
```

**Type**: `clean-dataset-error`

```json
{
  "type": "clean-dataset-error",
  "jobId": "uuid-string",
  "error": "Error message"
}
```

## UI/UX Flow

1. **User submit file/CSV để clean**
   - Toast hiển thị "Đang gửi dữ liệu để làm sạch"
   - Progress bar xuất hiện ở góc dưới bên phải với progress = 0%

2. **Backend xử lý từng chunk**
   - Mỗi chunk xong, FE nhận WebSocket notification
   - Progress bar update realtime (ví dụ: 3/10 chunks, 30%)

3. **Hoàn thành**
   - Progress bar hiển thị 100%
   - Status đổi thành "Hoàn thành" (màu xanh)
   - Button "Xem kết quả" xuất hiện

4. **Click "Xem kết quả"**
   - Gọi API lấy kết quả clean
   - Chuyển user sang trang create dataset với data đã clean
   - Progress bar biến mất

## Translation Keys

Các translation keys được sử dụng:

```json
{
  "ai_clean_processing": "Đang xử lý / Processing",
  "ai_clean_completed": "Hoàn thành / Completed",
  "ai_clean_error": "Lỗi / Error",
  "ai_clean_view_result": "Xem kết quả / View Result",
  "ai_clean_dismiss": "Đóng / Dismiss",
  "ai_clean_error_title": "Lỗi lấy kết quả / Error fetching result",
  "ai_clean_error_message": "Không thể lấy kết quả làm sạch / Unable to fetch cleaning result"
}
```

## Styling

Component sử dụng:

- Tailwind CSS cho styling
- Framer Motion cho animations
- Lucide React cho icons
- Gradient background và shadow effects

Progress bar được position `fixed` ở `bottom-6 right-6` với `z-50` để luôn hiển thị trên các component khác.

## Testing

### Test Scenario 1: Submit CSV

1. Vào trang Create Dataset
2. Chọn tab "Clean Dataset with AI"
3. Paste CSV data và click "Clean CSV with AI"
4. Quan sát progress bar xuất hiện và update realtime
5. Khi xong, click "Xem kết quả"

### Test Scenario 2: Submit Excel

1. Vào trang Create Dataset
2. Chọn tab "Clean Dataset with AI"
3. Upload file Excel
4. Quan sát progress bar và chunks processing
5. Verify result khi hoàn tất

### Test Scenario 3: Multiple Jobs

1. Submit nhiều files liên tiếp
2. Verify tất cả jobs đều hiển thị trong progress bar
3. Verify mỗi job update độc lập

## Notes

- Progress bar chỉ hiển thị khi có ít nhất 1 job active
- Jobs tự động bị remove khi user click "Xem kết quả" hoặc "Đóng"
- WebSocket tự động reconnect khi disconnect
- Progress được tính dựa trên: `(completed / total) * 100`
