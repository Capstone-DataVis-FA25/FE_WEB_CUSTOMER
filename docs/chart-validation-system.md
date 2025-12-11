# 📊 Chart Validation System

## Tổng Quan (Overview)

Hệ thống validation này đảm bảo người dùng chỉ có thể chọn các cột dữ liệu phù hợp với yêu cầu của từng loại biểu đồ.

---

## 🎯 Quy Tắc Validation (Validation Rules)

### **Line Chart (Biểu Đồ Đường)**

- **X-Axis (Trục hoành):**
  - ✅ Allowed: `text`, `date`, `string`
  - 📝 Reason: Đại diện cho thời gian hoặc danh mục tuần tự
  - ❌ Not Allowed: `number` (trừ khi là trục số liên tục)

- **Y-Axis (Trục tung) - Series:**
  - ✅ Allowed: `number` ONLY
  - 📝 Reason: Luôn biểu diễn giá trị đo lường

### **Bar Chart (Biểu Đồ Cột)**

- **X-Axis (Trục hoành):**
  - ✅ Allowed: `text`, `string`
  - 📝 Reason: Đại diện cho các phân loại (categories)
  - ❌ Not Allowed: `date`, `number`

- **Y-Axis (Trục tung) - Series:**
  - ✅ Allowed: `number` ONLY
  - 📝 Reason: Giá trị đo lường

### **Area Chart (Biểu Đồ Vùng)**

- **X-Axis (Trục hoành):**
  - ✅ Allowed: `text`, `date`, `string`
  - 📝 Reason: Giống Line Chart - thời gian hoặc danh mục tuần tự

- **Y-Axis (Trục tung) - Series:**
  - ✅ Allowed: `number` ONLY
  - 📝 Reason: Giá trị đo lường

---

## 📁 Cấu Trúc File (File Structure)

```
src/
├── utils/
│   └── chartValidation.ts          # ⭐ Core validation logic
├── components/charts/
│   ├── AxisConfigurationSection.tsx  # Uses validation for X-axis
│   └── SeriesManagementSection.tsx   # Uses validation for Y-axis (series)
```

---

## 🔧 Core Functions

### 1. `CHART_VALIDATION_RULES`

Định nghĩa quy tắc cho từng loại biểu đồ:

```typescript
export const CHART_VALIDATION_RULES: Record<ChartType, {...}> = {
  [ChartType.Line]: {
    xAxis: { allowedTypes: ['text', 'date', 'string'], ... },
    yAxis: { allowedTypes: ['number'], ... }
  },
  // ... bar, area
}
```

### 2. `isDataTypeValidForAxis()`

Kiểm tra xem kiểu dữ liệu có hợp lệ không:

```typescript
isDataTypeValidForAxis('line', 'x', 'text'); // ✅ true
isDataTypeValidForAxis('line', 'x', 'number'); // ❌ false
isDataTypeValidForAxis('line', 'y', 'number'); // ✅ true
```

### 3. `filterHeadersByAxisType()`

Lọc danh sách cột dựa trên quy tắc:

```typescript
const validColumns = filterHeadersByAxisType(
  headers, // All dataset columns
  chartType, // 'line' | 'bar' | 'area'
  'x' | 'y' // Which axis
);
```

### 4. `getAxisRequirementDescription()`

Trả về mô tả yêu cầu cho người dùng:

```typescript
getAxisRequirementDescription('line', 'x');
// → "X-axis should be time series or categorical data (text/date)"
```

---

## 🎨 UI Integration

### **AxisConfigurationSection** (X-Axis)

```tsx
// Filter valid X-axis columns
const validXAxisHeaders = filterHeadersByAxisType(dataHeaders, chartType, 'x');

// Dropdown only shows valid columns
<select>
  {validXAxisHeaders.map(header => (
    <option value={header.id}>
      {header.name} ({header.type})  {/* Show type to user */}
    </option>
  ))}
</select>

// Show helpful message
<p>💡 {xAxisRequirement}</p>

// Warning if no valid columns
{validXAxisHeaders.length === 0 && (
  <p>⚠️ No columns match the requirements for X-axis</p>
)}
```

### **SeriesManagementSection** (Y-Axis / Series)

```tsx
// Filter valid Y-axis columns (must be numeric)
const validYAxisHeaders = filterHeadersByAxisType(dataHeaders, chartType, 'y');

// Only numeric columns available for series
const availableColumns = validYAxisHeaders.map(h => h.id);

// Warning if no numeric columns
{
  validYAxisHeaders.length === 0 && (
    <div className="error">
      ⚠️ Series data (Y-axis) must be numeric. Your dataset does not contain any numeric columns.
    </div>
  );
}
```

---

## 🚀 Mở Rộng (Extension)

### Thêm Loại Biểu Đồ Mới

**Bước 1:** Thêm vào `ChartType` enum:

```typescript
// src/features/charts/chartTypes.ts
export enum ChartType {
  Line = 'line',
  Bar = 'bar',
  Area = 'area',
  Pie = 'pie', // ⭐ NEW
  Scatter = 'scatter', // ⭐ NEW
}
```

**Bước 2:** Thêm quy tắc validation:

```typescript
// src/utils/chartValidation.ts
export const CHART_VALIDATION_RULES = {
  // ... existing rules

  [ChartType.Pie]: {
    xAxis: {
      allowedTypes: ['text', 'string'],
      description: 'Categories should be text',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Values must be numeric',
    },
  },

  [ChartType.Scatter]: {
    xAxis: {
      allowedTypes: ['number'],
      description: 'X-axis should be numeric for scatter plots',
    },
    yAxis: {
      allowedTypes: ['number'],
      description: 'Y-axis must be numeric',
    },
  },
};
```

**Bước 3:** DONE! ✅ Hệ thống tự động áp dụng cho biểu đồ mới.

---

## 🧪 Testing Examples

### Example 1: Line Chart with Valid Data

```typescript
Dataset: [
  { date: '2024-01', sales: 100 },    // ✅ text/date + number
  { date: '2024-02', sales: 150 }
]

X-Axis: 'date' (text) → ✅ VALID
Y-Axis: 'sales' (number) → ✅ VALID
```

### Example 2: Line Chart with Invalid Data

```typescript
Dataset: [
  { id: 1, name: 'Product A' },    // ❌ number + text
  { id: 2, name: 'Product B' }
]

X-Axis: 'id' (number) → ❌ INVALID (LineChart X-axis should be text/date)
Y-Axis: 'name' (text) → ❌ INVALID (Y-axis must be number)

Result:
- validXAxisHeaders = [] (empty)
- validYAxisHeaders = [] (empty)
- User sees warning messages
```

### Example 3: Mixed Dataset

```typescript
Dataset: [
  { city: 'Hanoi', year: 2024, population: 8000000, region: 'North' }
]

For Line Chart:
- Valid X-Axis columns: ['city', 'region'] (text)
- Valid Y-Axis columns: ['population'] (number)
- ❌ 'year' not valid for X (number not allowed for Line Chart X-axis)

For Scatter Plot (if added):
- Valid X-Axis columns: ['year', 'population'] (number)
- Valid Y-Axis columns: ['year', 'population'] (number)
```

---

## 📊 Data Type Normalization

Hệ thống tự động chuẩn hóa các biến thể của kiểu dữ liệu:

```typescript
'str' → 'string'
'varchar' → 'string'
'int' → 'number'
'integer' → 'number'
'float' → 'number'
'datetime' → 'date'
'timestamp' → 'date'
```

---

## ✨ Benefits

1. **User Experience:**
   - ✅ Chỉ hiển thị cột hợp lệ
   - ✅ Thông báo rõ ràng khi không có cột phù hợp
   - ✅ Gợi ý yêu cầu cho mỗi trục

2. **Data Integrity:**
   - ✅ Ngăn chặn lỗi khi render chart
   - ✅ Đảm bảo dữ liệu đúng kiểu

3. **Maintainability:**
   - ✅ Centralized validation logic
   - ✅ Dễ dàng mở rộng cho loại biểu đồ mới
   - ✅ Type-safe với TypeScript

4. **Scalability:**
   - ✅ Support thêm loại biểu đồ chỉ bằng config
   - ✅ Không cần sửa UI components

---

## 🔍 Debug Tips

**Check validation rules:**

```typescript
console.log(CHART_VALIDATION_RULES[ChartType.Line]);
```

**Check filtered headers:**

```typescript
console.log('Valid X-axis columns:', validXAxisHeaders);
console.log('Valid Y-axis columns:', validYAxisHeaders);
```

**Test specific column:**

```typescript
const isValid = isDataTypeValidForAxis('line', 'x', 'number');
console.log('Is number valid for Line X-axis?', isValid); // false
```

---

## 📝 Notes

- **Performance:** Filtering chỉ chạy khi dataset hoặc chartType thay đổi
- **Backward Compatibility:** Hàm hỗ trợ cả enum và string values
- **Extensible:** Dễ dàng thêm custom validators trong tương lai

---

**Author:** GitHub Copilot  
**Date:** October 16, 2025  
**Version:** 1.0
