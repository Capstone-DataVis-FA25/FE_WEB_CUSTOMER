/**
 * Data Pair Analyzer
 * Analyzes dataset columns and recommends suitable X-Y axis pairs for charts
 */

import type { DataHeader } from './dataProcessors';

export interface ColumnAnalysis {
  name: string;
  id: string;
  type: 'text' | 'number' | 'date';
  uniqueCount: number;
  nullCount: number;
  totalCount: number;
  varianceScore: number; // 0-1, higher means more variation
  isSequential: boolean;
  hasTimePattern: boolean;
  numericRange?: { min: number; max: number };
  sampleValues: any[];
}

// Extended DataHeader with data array (for analysis purposes)
export interface DataHeaderWithData extends DataHeader {
  data?: any[];
}

export interface DataPairRecommendation {
  xColumnId: string;
  xColumnName: string;
  yColumnId: string;
  yColumnName: string;
  score: number; // 0-100
  reason: string;
  chartType: 'area' | 'scatter';
}

/**
 * Analyze a single column to extract useful metadata
 */
export function analyzeColumn(header: DataHeaderWithData): ColumnAnalysis {
  const data = header.data || [];
  const totalCount = data.length;

  // Count unique values and nulls
  const uniqueValues = new Set(data.filter((v: any) => v != null && v !== ''));
  const uniqueCount = uniqueValues.size;
  const nullCount = data.filter((v: any) => v == null || v === '').length;

  // Calculate variance score for numeric columns
  let varianceScore = 0;
  let numericRange: { min: number; max: number } | undefined;

  if (header.type === 'number') {
    const numericData = data
      .filter((v: any) => v != null && !isNaN(Number(v)))
      .map((v: any) => Number(v));

    if (numericData.length > 0) {
      const min = Math.min(...numericData);
      const max = Math.max(...numericData);
      const mean = numericData.reduce((sum: number, v: number) => sum + v, 0) / numericData.length;

      numericRange = { min, max };

      // Calculate coefficient of variation (CV) as variance score
      const variance =
        numericData.reduce((sum: number, v: number) => sum + Math.pow(v - mean, 2), 0) /
        numericData.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean !== 0 ? stdDev / Math.abs(mean) : 0;

      // Normalize CV to 0-1 range (cap at 2.0 for very high variance)
      varianceScore = Math.min(cv / 2.0, 1.0);
    }
  }

  // Check if data is sequential (for time series or ordered categories)
  const isSequential = checkIfSequential(data, header.type);

  // Check if data has time-related patterns
  const hasTimePattern = checkTimePattern(data, header.name);

  // Get sample values (first 5 non-null)
  const sampleValues = data.filter((v: any) => v != null && v !== '').slice(0, 5);

  return {
    name: header.name,
    id: header.id || header.name, // Fallback to name if id is undefined
    type: header.type,
    uniqueCount,
    nullCount,
    totalCount,
    varianceScore,
    isSequential,
    hasTimePattern,
    numericRange,
    sampleValues,
  };
}

/**
 * Check if data appears to be sequential
 */
function checkIfSequential(data: any[], type: string): boolean {
  if (type === 'date') return true;

  // Check for numeric sequences
  if (type === 'number') {
    const numericData = data.filter(v => v != null && !isNaN(Number(v))).map(v => Number(v));

    if (numericData.length < 3) return false;

    // Check if values are in ascending or descending order
    let ascending = true;
    let descending = true;

    for (let i = 1; i < numericData.length; i++) {
      if (numericData[i] < numericData[i - 1]) ascending = false;
      if (numericData[i] > numericData[i - 1]) descending = false;
    }

    return ascending || descending;
  }

  // Check for text patterns like Q1, Q2, Q3 or Week 1, Week 2
  if (type === 'text') {
    const textData = data.filter(v => v != null && v !== '').map(v => String(v));
    const hasNumberSuffix = textData.every(v => /\d+$/.test(v));
    return hasNumberSuffix;
  }

  return false;
}

/**
 * Check if column name or data suggests time-related information
 */
function checkTimePattern(data: any[], columnName: string): boolean {
  const lowerName = columnName.toLowerCase();

  // Check column name for time-related keywords
  const timeKeywords = [
    'date',
    'time',
    'year',
    'month',
    'day',
    'week',
    'quarter',
    'period',
    'timestamp',
    'ngày',
    'tháng',
    'năm',
    'tuần',
    'quý',
  ];

  const hasTimeKeyword = timeKeywords.some(keyword => lowerName.includes(keyword));
  if (hasTimeKeyword) return true;

  // Check if data looks like dates
  const sampleData = data.filter(v => v != null && v !== '').slice(0, 10);
  if (sampleData.length === 0) return false;

  // Check for date patterns (YYYY-MM-DD, DD/MM/YYYY, etc.)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
    /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
    /^Q[1-4]\s\d{4}/, // Q1 2024
  ];

  const looksLikeDate = sampleData.some(v => datePatterns.some(pattern => pattern.test(String(v))));

  return looksLikeDate;
}

/**
 * Score a column's suitability as X-axis for Area Chart
 */
export function scoreAreaChartXAxis(column: ColumnAnalysis): number {
  let score = 0;

  // Type preference (40 points)
  if (column.type === 'date') {
    score += 40;
  } else if (column.type === 'number' && column.isSequential) {
    score += 30;
  } else if (column.type === 'text' && column.hasTimePattern) {
    score += 25;
  } else if (column.type === 'text' && column.isSequential) {
    score += 20;
  }

  // Sequential data preferred (30 points)
  if (column.isSequential) {
    score += 30;
  }

  // Time pattern bonus (10 points)
  if (column.hasTimePattern) {
    score += 10;
  }

  // Optimal number of unique values (15 points)
  // Best: 3-50 points, Good: 51-200, Acceptable: 201-500
  if (column.uniqueCount >= 3 && column.uniqueCount <= 50) {
    score += 15;
  } else if (column.uniqueCount > 50 && column.uniqueCount <= 200) {
    score += 10;
  } else if (column.uniqueCount > 200 && column.uniqueCount <= 500) {
    score += 5;
  }

  // Low null count (5 points)
  const nullRate = column.nullCount / column.totalCount;
  if (nullRate === 0) {
    score += 5;
  } else if (nullRate < 0.1) {
    score += 3;
  }

  return Math.min(score, 100);
}

/**
 * Score a column's suitability as Y-axis (for both Area and Scatter)
 */
export function scoreYAxis(column: ColumnAnalysis): number {
  let score = 0;

  // Must be numeric (50 points)
  if (column.type !== 'number') {
    return 0; // Cannot use non-numeric as Y-axis
  }
  score += 50;

  // High variance preferred for interesting charts (30 points)
  score += column.varianceScore * 30;

  // Low null rate (15 points)
  const nullRate = column.nullCount / column.totalCount;
  score += (1 - nullRate) * 15;

  // Reasonable number of unique values (5 points)
  // Too few unique values means boring chart
  if (column.uniqueCount >= 5) {
    score += 5;
  } else if (column.uniqueCount >= 3) {
    score += 2;
  }

  return Math.min(score, 100);
}

/**
 * Score a column's suitability for Scatter Chart (both X and Y)
 */
export function scoreScatterAxis(column: ColumnAnalysis): number {
  let score = 0;

  // Must be numeric (60 points)
  if (column.type !== 'number') {
    return 0; // Scatter charts need numeric data
  }
  score += 60;

  // High variance preferred (scatter needs scatter!) (25 points)
  if (column.varianceScore > 0.3) {
    score += 25;
  } else if (column.varianceScore > 0.1) {
    score += 15;
  } else {
    score += 5; // Low variance = boring scatter
  }

  // Optimal number of data points (10 points)
  if (column.uniqueCount >= 10 && column.uniqueCount <= 1000) {
    score += 10;
  } else if (column.uniqueCount >= 5) {
    score += 5;
  }

  // Low null rate (5 points)
  const nullRate = column.nullCount / column.totalCount;
  score += (1 - nullRate) * 5;

  return Math.min(score, 100);
}

/**
 * Generate human-readable reason for recommendation
 */
function generateReason(
  xColumn: ColumnAnalysis,
  yColumn: ColumnAnalysis,
  chartType: 'area' | 'scatter'
): string {
  if (chartType === 'area') {
    const reasons: string[] = [];

    if (xColumn.type === 'date') {
      reasons.push('Time series data');
    } else if (xColumn.isSequential) {
      reasons.push('Sequential X-axis');
    }

    if (yColumn.varianceScore > 0.5) {
      reasons.push('high variation in values');
    } else {
      reasons.push('shows trends over time');
    }

    return reasons.join(', ');
  } else {
    // Scatter chart
    const reasons: string[] = [];

    if (xColumn.varianceScore > 0.5 && yColumn.varianceScore > 0.5) {
      reasons.push('Both variables show good variance');
    } else {
      reasons.push('Explore correlation');
    }

    if (xColumn.uniqueCount > 20 && yColumn.uniqueCount > 20) {
      reasons.push('sufficient data points');
    }

    return reasons.join(', ');
  }
}

/**
 * Main function: Generate data pair recommendations
 */
export function suggestDataPairs(
  headers: DataHeaderWithData[],
  chartType: 'area' | 'scatter',
  maxRecommendations: number = 5
): DataPairRecommendation[] {
  const recommendations: DataPairRecommendation[] = [];

  // Analyze all columns
  const analyzedColumns = headers.map(h => analyzeColumn(h));

  // Find X-axis candidates
  const xCandidates = analyzedColumns
    .map(col => ({
      column: col,
      score: chartType === 'area' ? scoreAreaChartXAxis(col) : scoreScatterAxis(col),
    }))
    .filter(c => c.score >= 30) // Threshold: at least 30% suitable
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Top 3 X candidates

  // Find Y-axis candidates
  const yCandidates = analyzedColumns
    .filter(col => col.type === 'number') // Y must be numeric
    .map(col => ({
      column: col,
      score: chartType === 'area' ? scoreYAxis(col) : scoreScatterAxis(col),
    }))
    .filter(c => c.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5 Y candidates

  // Generate all combinations
  for (const x of xCandidates) {
    for (const y of yCandidates) {
      // Don't pair a column with itself
      if (x.column.id === y.column.id) continue;

      // Calculate combined score (weighted average)
      const combinedScore = x.score * 0.4 + y.score * 0.6;

      // Generate reason
      const reason = generateReason(x.column, y.column, chartType);

      recommendations.push({
        xColumnId: x.column.id,
        xColumnName: x.column.name,
        yColumnId: y.column.id,
        yColumnName: y.column.name,
        score: combinedScore,
        reason,
        chartType,
      });
    }
  }

  // Sort by score and return top N
  return recommendations.sort((a, b) => b.score - a.score).slice(0, maxRecommendations);
}
