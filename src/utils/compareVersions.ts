/**
 * Utility for comparing chart versions on the frontend
 */

type DiffLeaf = { current: any; historical: any };
type DiffObject = { [key: string]: DiffLeaf | DiffObject };

/**
 * Deep comparison of two objects to find differences
 * Returns nested object structure with differences
 */
export function deepCompare(current: any, historical: any, path: string = ''): DiffObject | null {
  // If both are identical, no difference
  if (JSON.stringify(current) === JSON.stringify(historical)) {
    return null;
  }

  // If types differ, or one is null/undefined, return as leaf difference
  if (
    typeof current !== typeof historical ||
    current === null ||
    historical === null ||
    current === undefined ||
    historical === undefined
  ) {
    return { current, historical } as any;
  }

  // If not objects (primitives), return as leaf difference
  if (typeof current !== 'object') {
    if (current !== historical) {
      return { current, historical } as any;
    }
    return null;
  }

  // Both are objects/arrays, recurse through keys
  const allKeys = new Set([...Object.keys(current), ...Object.keys(historical)]);
  const differences: DiffObject = {};

  for (const key of allKeys) {
    const currentValue = current[key];
    const historicalValue = historical[key];

    const diff = deepCompare(currentValue, historicalValue, path ? `${path}.${key}` : key);
    if (diff !== null) {
      differences[key] = diff;
    }
  }

  return Object.keys(differences).length > 0 ? differences : null;
}

/**
 * Compare current chart data with historical version
 * Returns comparison result in the same format as backend
 */
export function compareChartVersions(
  currentChart: {
    name: string;
    description?: string;
    type: string;
    datasetId: string;
    config: any;
    updatedAt: string;
  },
  historicalVersion: {
    name: string;
    description?: string;
    type: string;
    datasetId: string;
    config: any;
    createdAt: string;
  }
) {
  // Build comparison objects
  const currentData = {
    name: currentChart.name,
    description: currentChart.description,
    type: currentChart.type,
    datasetId: currentChart.datasetId,
    config: currentChart.config,
  };

  const historicalData = {
    name: historicalVersion.name,
    description: historicalVersion.description,
    type: historicalVersion.type,
    datasetId: historicalVersion.datasetId,
    config: historicalVersion.config,
    imageUrl: (historicalVersion as any).imageUrl,
  };

  // Deep compare
  const differences = deepCompare(currentData, historicalData) || {};

  return {
    current: {
      name: currentChart.name,
      description: currentChart.description,
      type: currentChart.type,
      datasetId: currentChart.datasetId,
      config: currentChart.config,
      updatedAt: currentChart.updatedAt,
    },
    historical: {
      name: historicalVersion.name,
      description: historicalVersion.description,
      type: historicalVersion.type,
      datasetId: historicalVersion.datasetId,
      config: historicalVersion.config,
      createdAt: historicalVersion.createdAt,
      imageUrl: (historicalVersion as any).imageUrl,
    },
    differences,
  };
}
