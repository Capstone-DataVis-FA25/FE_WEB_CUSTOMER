# Unified Chart Editor

## Tổng quan

UnifiedChartEditor là một component được thiết kế để thay thế việc sử dụng switch case trong ChartEditorPage. Nó cung cấp một giao diện thống nhất cho việc chỉnh sửa các loại biểu đồ khác nhau (Line, Bar, Area) mà không cần lặp lại code cho phần settings.

## Các tính năng chính

### 1. UnifiedChartEditor

- **Tích hợp tất cả loại chart**: Line, Bar, Area trong một component duy nhất
- **Settings panel chung**: Sử dụng lại các section settings từ ChartEditorShared
- **Dynamic chart rendering**: Tự động render D3 component phù hợp dựa trên chart type
- **Chart type switching**: Cho phép thay đổi loại chart trong runtime
- **Unified configuration**: Sử dụng union type để handle config cho tất cả loại chart

### 2. ChartTypeSwitcher

- **Multiple variants**: Select, Buttons, Cards
- **Responsive design**: Tự động adapt với different screen sizes
- **Accessibility**: Keyboard navigation và screen reader support
- **Customizable**: Dễ dàng customize appearance và behavior

## Cách sử dụng

### Basic Usage

```tsx
import UnifiedChartEditor, { type ChartType } from '@/components/charts/UnifiedChartEditor';

const MyComponent = () => {
  const [chartType, setChartType] = useState<ChartType>('line');

  return (
    <UnifiedChartEditor
      initialArrayData={sampleData}
      initialChartType={chartType}
      onConfigChange={config => console.log('Config changed:', config)}
      onDataChange={data => console.log('Data changed:', data)}
      onChartTypeChange={setChartType}
      allowChartTypeChange={true}
    />
  );
};
```

### Với ChartTypeSwitcher

```tsx
import ChartTypeSwitcher from '@/components/charts/ChartTypeSwitcher';

const MyComponent = () => {
  const [chartType, setChartType] = useState<ChartType>('line');

  return (
    <div>
      <ChartTypeSwitcher
        currentType={chartType}
        onTypeChange={setChartType}
        variant="select" // hoặc "buttons" hoặc "cards"
      />
      <UnifiedChartEditor
        initialChartType={chartType}
        // ... other props
      />
    </div>
  );
};
```

## Props

### UnifiedChartEditor Props

| Prop                   | Type                                    | Required | Description                                  |
| ---------------------- | --------------------------------------- | -------- | -------------------------------------------- |
| `initialArrayData`     | `(string \| number)[][]`                | No       | Dữ liệu mảng 2D để render chart              |
| `initialChartType`     | `ChartType`                             | No       | Loại chart ban đầu ('line', 'bar', 'area')   |
| `initialConfig`        | `Partial<UnifiedChartConfig>`           | No       | Cấu hình ban đầu cho chart                   |
| `initialColors`        | `ColorConfig`                           | No       | Màu sắc ban đầu                              |
| `initialFormatters`    | `Partial<FormatterConfig>`              | No       | Formatter ban đầu                            |
| `onConfigChange`       | `(config: UnifiedChartConfig) => void`  | No       | Callback khi config thay đổi                 |
| `onDataChange`         | `(data: ChartDataPoint[]) => void`      | No       | Callback khi data thay đổi                   |
| `onColorsChange`       | `(colors: ColorConfig) => void`         | No       | Callback khi colors thay đổi                 |
| `onFormattersChange`   | `(formatters: FormatterConfig) => void` | No       | Callback khi formatters thay đổi             |
| `onChartTypeChange`    | `(chartType: ChartType) => void`        | No       | Callback khi chart type thay đổi             |
| `dataset`              | `Dataset`                               | No       | Dataset object với headers                   |
| `allowChartTypeChange` | `boolean`                               | No       | Cho phép thay đổi chart type (default: true) |

### ChartTypeSwitcher Props

| Prop           | Type                               | Required | Description                       |
| -------------- | ---------------------------------- | -------- | --------------------------------- |
| `currentType`  | `ChartType`                        | Yes      | Loại chart hiện tại               |
| `onTypeChange` | `(type: ChartType) => void`        | Yes      | Callback khi type thay đổi        |
| `variant`      | `'select' \| 'buttons' \| 'cards'` | No       | Kiểu hiển thị (default: 'select') |
| `disabled`     | `boolean`                          | No       | Disable switcher                  |
| `className`    | `string`                           | No       | Custom CSS class                  |

## Lợi ích

### 1. Code Reusability

- **Không lặp lại code**: Settings panel được sử dụng chung cho tất cả loại chart
- **Maintainability**: Chỉ cần maintain một component thay vì 3 components riêng biệt
- **Consistency**: UI/UX nhất quán across tất cả chart types

### 2. Performance

- **Lazy loading**: Chỉ render D3 component cần thiết
- **Memory efficient**: Không tạo multiple instances của settings panel
- **Optimized re-renders**: Chỉ re-render khi cần thiết

### 3. Developer Experience

- **Type safety**: Full TypeScript support với union types
- **Easy integration**: Drop-in replacement cho existing chart editors
- **Flexible configuration**: Dễ dàng customize behavior

## Migration từ ChartEditorPage

### Before (Switch Case)

```tsx
const renderChartEditor = () => {
  switch (typeChart.toLowerCase()) {
    case 'line':
      return <LineChartEditor {...commonProps} />;
    case 'bar':
      return <BarChartEditor {...commonProps} />;
    case 'area':
      return <AreaChartEditor {...commonProps} />;
    default:
      return <BarChartEditor {...commonProps} />;
  }
};
```

### After (Unified Editor)

```tsx
<UnifiedChartEditor
  initialArrayData={arrayData}
  initialChartType={currentChartType}
  initialConfig={config}
  onConfigChange={handleConfigChange}
  onChartTypeChange={handleChartTypeChange}
  allowChartTypeChange={mode === 'edit'}
/>
```

## Demo

Xem `UnifiedChartEditorDemo.tsx` để có ví dụ đầy đủ về cách sử dụng component này.

## Tương lai

- **Thêm chart types mới**: Dễ dàng extend để support thêm chart types
- **Custom chart components**: Cho phép inject custom D3 components
- **Advanced settings**: Thêm more advanced configuration options
- **Export/Import**: Built-in support cho export/import chart configurations
