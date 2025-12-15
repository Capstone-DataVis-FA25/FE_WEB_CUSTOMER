/**
 * Correlation Analysis Utilities
 * Provides functions for calculating various types of correlations between numeric datasets
 */

export interface CorrelationResult {
  coefficient: number;
  type: 'pearson' | 'spearman' | 'kendall';
  strength:
    | 'perfect-positive'
    | 'strong-positive'
    | 'moderate-positive'
    | 'weak-positive'
    | 'none'
    | 'weak-negative'
    | 'moderate-negative'
    | 'strong-negative'
    | 'perfect-negative';
  description: string;
}

export interface CorrelationMatrix {
  fields: string[];
  matrix: number[][];
  type: 'pearson' | 'spearman' | 'kendall';
}

/**
 * Interpret correlation coefficient strength
 */
export function interpretCorrelation(coefficient: number): {
  strength: CorrelationResult['strength'];
  description: string;
} {
  const absValue = Math.abs(coefficient);
  const isPositive = coefficient >= 0;

  if (absValue === 1) {
    return {
      strength: isPositive ? 'perfect-positive' : 'perfect-negative',
      description: isPositive ? 'Tương quan dương hoàn hảo' : 'Tương quan âm hoàn hảo',
    };
  } else if (absValue >= 0.7) {
    return {
      strength: isPositive ? 'strong-positive' : 'strong-negative',
      description: isPositive ? 'Tương quan dương mạnh' : 'Tương quan âm mạnh',
    };
  } else if (absValue >= 0.3) {
    return {
      strength: isPositive ? 'moderate-positive' : 'moderate-negative',
      description: isPositive ? 'Tương quan dương trung bình' : 'Tương quan âm trung bình',
    };
  } else if (absValue > 0) {
    return {
      strength: isPositive ? 'weak-positive' : 'weak-negative',
      description: isPositive ? 'Tương quan dương yếu' : 'Tương quan âm yếu',
    };
  } else {
    return {
      strength: 'none',
      description: 'Không có tương quan',
    };
  }
}

/**
 * Calculate mean of an array
 */
function mean(arr: number[]): number {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(arr: number[]): number {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate Pearson Correlation Coefficient
 * Best for: Linear relationships, continuous data, normally distributed data
 * Formula: r = cov(X, Y) / (σX · σY)
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);

  // Handle case where standard deviation is 0 (constant values)
  if (stdX === 0 || stdY === 0) {
    return {
      coefficient: 0,
      type: 'pearson',
      ...interpretCorrelation(0),
    };
  }

  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
  }

  const coefficient = numerator / (n * stdX * stdY);

  return {
    coefficient,
    type: 'pearson',
    ...interpretCorrelation(coefficient),
  };
}

/**
 * Calculate Spearman Rank Correlation
 * Best for: Non-linear monotonic relationships, ordinal data, non-normally distributed data
 */
export function calculateSpearmanCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  // Convert to ranks
  const ranksX = getRanks(x);
  const ranksY = getRanks(y);

  // Calculate Pearson correlation on ranks
  const result = calculatePearsonCorrelation(ranksX, ranksY);

  return {
    ...result,
    type: 'spearman',
  };
}

/**
 * Helper function to get ranks of values
 * Handles ties by assigning average rank
 */
function getRanks(arr: number[]): number[] {
  const sorted = arr.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);

  const ranks: number[] = new Array(arr.length);

  let i = 0;
  while (i < sorted.length) {
    // Find all tied values
    let j = i;
    while (j < sorted.length && sorted[j].value === sorted[i].value) {
      j++;
    }

    // Assign average rank to all tied values
    const avgRank = (i + j + 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].index] = avgRank;
    }

    i = j;
  }

  return ranks;
}

/**
 * Calculate Kendall Tau Correlation
 * Best for: Small datasets, many tied values, measuring agreement
 */
export function calculateKendallTauCorrelation(x: number[], y: number[]): CorrelationResult {
  if (x.length !== y.length || x.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const n = x.length;
  let concordant = 0;
  let discordant = 0;

  // Count concordant and discordant pairs
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const signX = Math.sign(x[j] - x[i]);
      const signY = Math.sign(y[j] - y[i]);

      if (signX * signY > 0) {
        concordant++;
      } else if (signX * signY < 0) {
        discordant++;
      }
      // If signX * signY === 0, it's a tie, don't count
    }
  }

  const totalPairs = (n * (n - 1)) / 2;
  const coefficient = (concordant - discordant) / totalPairs;

  return {
    coefficient,
    type: 'kendall',
    ...interpretCorrelation(coefficient),
  };
}

/**
 * Calculate correlation matrix for multiple fields
 */
export function calculateCorrelationMatrix(
  data: Record<string, number[]>,
  type: 'pearson' | 'spearman' | 'kendall' = 'pearson'
): CorrelationMatrix {
  const fields = Object.keys(data);
  const n = fields.length;
  const matrix: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));

  const correlationFn =
    type === 'pearson'
      ? calculatePearsonCorrelation
      : type === 'spearman'
        ? calculateSpearmanCorrelation
        : calculateKendallTauCorrelation;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Correlation with itself is always 1
      } else if (i < j) {
        try {
          const result = correlationFn(data[fields[i]], data[fields[j]]);
          matrix[i][j] = result.coefficient;
          matrix[j][i] = result.coefficient; // Symmetric
        } catch {
          matrix[i][j] = 0;
          matrix[j][i] = 0;
        }
      }
    }
  }

  return {
    fields,
    matrix,
    type,
  };
}

/**
 * Extract numeric columns from dataset
 */
export function extractNumericColumns(
  headers: { name: string }[],
  data: (string | number | null)[][]
): Record<string, number[]> {
  const numericData: Record<string, number[]> = {};

  headers.forEach((header, colIndex) => {
    const columnValues: number[] = [];
    let isNumericColumn = true;

    for (const row of data) {
      const value = row[colIndex];

      if (value === null || value === undefined || value === '') {
        continue; // Skip null/empty values
      }

      const numValue = typeof value === 'number' ? value : parseFloat(String(value));

      if (isNaN(numValue)) {
        isNumericColumn = false;
        break;
      }

      columnValues.push(numValue);
    }

    // Only include if column is numeric and has at least 2 values
    if (isNumericColumn && columnValues.length >= 2) {
      numericData[header.name] = columnValues;
    }
  });

  return numericData;
}

/**
 * Get color for correlation value (for heatmap visualization)
 */
export function getCorrelationColor(value: number): string {
  const absValue = Math.abs(value);

  if (value > 0) {
    // Positive correlation: shades of blue
    if (absValue >= 0.7) return '#0ea5e9'; // sky-500
    if (absValue >= 0.3) return '#7dd3fc'; // sky-300
    return '#e0f2fe'; // sky-100
  } else if (value < 0) {
    // Negative correlation: shades of red
    if (absValue >= 0.7) return '#ef4444'; // red-500
    if (absValue >= 0.3) return '#f87171'; // red-400
    return '#fee2e2'; // red-100
  }

  return '#f1f5f9'; // slate-100 for no correlation
}

/**
 * Get text color based on background correlation color
 */
export function getCorrelationTextColor(value: number): string {
  const absValue = Math.abs(value);
  return absValue >= 0.5 ? '#ffffff' : '#1e293b'; // white or slate-800
}

/**
 * Correlation Insight Interface
 */
export interface CorrelationInsight {
  id: string;
  type: 'perfect' | 'strong' | 'moderate' | 'unexpected' | 'warning';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  field1: string;
  field2: string;
  coefficient: number;
  title: string;
  description: string;
  interpretation: string;
  recommendation?: string;
}

/**
 * Analyze correlation matrix and extract insights
 */
export function analyzeCorrelationInsights(
  correlationMatrix: CorrelationMatrix
): CorrelationInsight[] {
  const { fields, matrix } = correlationMatrix;
  const insights: CorrelationInsight[] = [];
  let insightId = 0;

  // Skip ID-like fields from meaningful insights
  const isIdField = (fieldName: string): boolean => {
    const lower = fieldName.toLowerCase();
    return lower === 'id' || lower.includes('_id') || lower.startsWith('id_');
  };

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const field1 = fields[i];
      const field2 = fields[j];
      const coef = matrix[i][j];
      const absCoef = Math.abs(coef);

      // Skip if either field is an ID field
      if (isIdField(field1) || isIdField(field2)) {
        continue;
      }

      // Perfect correlation (±1.0)
      if (absCoef === 1.0) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'perfect',
          severity: 'critical',
          field1,
          field2,
          coefficient: coef,
          title: coef > 0 ? 'Tương quan hoàn hảo dương' : 'Tương quan hoàn hảo âm',
          description: `${field1} và ${field2} có mối quan hệ ${coef > 0 ? 'tỷ lệ thuận' : 'tỷ lệ nghịch'} hoàn hảo (${coef.toFixed(2)})`,
          interpretation:
            coef > 0
              ? `Khi ${field1} tăng, ${field2} cũng tăng với tỷ lệ hoàn toàn tuyến tính. Hai biến này có thể là cùng một thông tin được biểu diễn khác nhau.`
              : `Khi ${field1} tăng, ${field2} giảm với tỷ lệ hoàn toàn tuyến tính. Ví dụ: Tuổi và Năm sinh thường có mối quan hệ này.`,
          recommendation:
            'Xem xét có thể loại bỏ một trong hai biến để tránh multicollinearity trong mô hình dự đoán.',
        });
      }
      // Nearly perfect correlation (0.95-0.99)
      else if (absCoef >= 0.95) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'perfect',
          severity: 'high',
          field1,
          field2,
          coefficient: coef,
          title: 'Tương quan gần như hoàn hảo',
          description: `${field1} và ${field2} có mối liên hệ cực kỳ chặt chẽ (${coef.toFixed(2)})`,
          interpretation:
            coef > 0
              ? `${field1} và ${field2} gần như di chuyển cùng nhau. Thay đổi trong ${field1} hầu như luôn dẫn đến thay đổi tương ứng trong ${field2}.`
              : `${field1} và ${field2} có xu hướng ngược chiều cực mạnh. Đây có thể là hai mặt của cùng một hiện tượng.`,
          recommendation:
            'Hai biến này có thể mang thông tin rất tương đồng. Cân nhắc kết hợp hoặc chọn một trong hai.',
        });
      }
      // Strong correlation (0.7-0.94)
      else if (absCoef >= 0.7) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'strong',
          severity: 'high',
          field1,
          field2,
          coefficient: coef,
          title: coef > 0 ? 'Mối liên hệ mạnh cùng chiều' : 'Mối liên hệ mạnh ngược chiều',
          description: `Phát hiện tương quan mạnh giữa ${field1} và ${field2} (${coef.toFixed(2)})`,
          interpretation:
            coef > 0
              ? `Có xu hướng rõ ràng: khi ${field1} tăng, ${field2} cũng có xu hướng tăng theo. Đây là một insight quan trọng để hiểu cấu trúc dữ liệu.`
              : `Có xu hướng ngược chiều rõ ràng: khi ${field1} tăng, ${field2} có xu hướng giảm. Điều này cho thấy một mối quan hệ đáng chú ý.`,
          recommendation:
            coef > 0
              ? `Có thể sử dụng ${field1} để dự đoán ${field2} hoặc ngược lại. Xem xét tạo biến tổng hợp từ hai biến này.`
              : `Mối quan hệ ngược chiều này có thể hữu ích trong phân tích trade-off hoặc tối ưu hóa.`,
        });
      }
      // Moderate positive correlation (0.5-0.69)
      else if (coef >= 0.5 && coef < 0.7) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'moderate',
          severity: 'medium',
          field1,
          field2,
          coefficient: coef,
          title: 'Liên quan trung bình dương',
          description: `${field1} và ${field2} có liên quan trung bình cùng chiều (${coef.toFixed(2)})`,
          interpretation: `Có mối liên hệ đáng kể giữa ${field1} và ${field2}, nhưng không quá chặt chẽ. Các yếu tố khác cũng ảnh hưởng đến mối quan hệ này.`,
          recommendation: `Khám phá sâu hơn về mối quan hệ này. Có thể có các biến trung gian hoặc yếu tố điều tiết ảnh hưởng.`,
        });
      }
      // Moderate negative correlation (-0.69 to -0.5)
      else if (coef <= -0.5 && coef > -0.7) {
        insights.push({
          id: `insight-${insightId++}`,
          type: 'moderate',
          severity: 'medium',
          field1,
          field2,
          coefficient: coef,
          title: 'Liên quan trung bình âm',
          description: `${field1} và ${field2} có xu hướng ngược chiều ở mức trung bình (${coef.toFixed(2)})`,
          interpretation: `Khi ${field1} tăng, ${field2} có xu hướng giảm, tuy nhiên mối quan hệ này không hoàn toàn nhất quán.`,
          recommendation: `Điều tra thêm để hiểu tại sao hai biến này có xu hướng ngược chiều. Có thể hữu ích trong việc cân bằng hoặc đánh đổi.`,
        });
      }
      // Unexpected near-zero correlation
      else if (absCoef < 0.1) {
        // Only report if fields seem semantically related (basic heuristic)
        const seemsRelated =
          (field1.toLowerCase().includes('age') && field2.toLowerCase().includes('salary')) ||
          (field1.toLowerCase().includes('price') && field2.toLowerCase().includes('sales')) ||
          (field1.toLowerCase().includes('income') && field2.toLowerCase().includes('expense'));

        if (seemsRelated) {
          insights.push({
            id: `insight-${insightId++}`,
            type: 'unexpected',
            severity: 'info',
            field1,
            field2,
            coefficient: coef,
            title: 'Không có liên hệ (bất ngờ)',
            description: `${field1} và ${field2} gần như không có liên hệ (${coef.toFixed(2)})`,
            interpretation: `Mặc dù có vẻ như hai biến này nên có liên hệ với nhau, nhưng dữ liệu cho thấy chúng độc lập. Điều này có thể là một phát hiện quan trọng.`,
            recommendation: `Xác minh lại dữ liệu và xem xét các yếu tố ẩn có thể làm giảm tương quan.`,
          });
        }
      }
    }
  }

  // Sort insights by severity and coefficient magnitude
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  insights.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return Math.abs(b.coefficient) - Math.abs(a.coefficient);
  });

  return insights;
}

/**
 * Get top N strongest correlations (excluding diagonal)
 */
export function getTopCorrelations(
  correlationMatrix: CorrelationMatrix,
  n: number = 5
): Array<{ field1: string; field2: string; coefficient: number }> {
  const { fields, matrix } = correlationMatrix;
  const correlations: Array<{ field1: string; field2: string; coefficient: number }> = [];

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      correlations.push({
        field1: fields[i],
        field2: fields[j],
        coefficient: matrix[i][j],
      });
    }
  }

  // Sort by absolute value of coefficient
  correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  return correlations.slice(0, n);
}
