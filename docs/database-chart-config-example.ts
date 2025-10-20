/*
This is the correct Chart config structure for your database.
Update your Chart record in the database to have this config:

UPDATE "Chart" 
SET config = '{
  "version": "1.0",
  "chartType": "line",
  "width": 800,
  "height": 400,
  "margin": {
    "top": 20,
    "right": 40,
    "bottom": 60,
    "left": 80
  },
  "title": "First chart",
  "xAxisKey": "Name",
  "xAxisLabel": "Name",
  "xAxisStart": "auto",
  "xAxisRotation": 0,
  "yAxisKeys": ["Age", "Salary"],
  "yAxisLabel": "Values",
  "yAxisStart": "auto",
  "yAxisRotation": 0,
  "showAxisLabels": true,
  "showAxisTicks": true,
  "showLegend": true,
  "showGrid": true,
  "showPoints": true,
  "showTooltip": true,
  "animationDuration": 1000,
  "curve": "curveMonotoneX",
  "disabledLines": [],
  "lineWidth": 2,
  "pointRadius": 4,
  "gridOpacity": 0.3,
  "legendPosition": "bottom",
  "theme": "auto",
  "backgroundColor": "transparent",
  "titleFontSize": 16,
  "labelFontSize": 12,
  "legendFontSize": 11,
  "enableZoom": false,
  "enablePan": false,
  "zoomExtent": 8,
  "colors": {
    "Age": {
      "light": "#3b82f6",
      "dark": "#60a5fa"
    },
    "Salary": {
      "light": "#f97316",
      "dark": "#fb923c"
    }
  },
  "formatters": {
    "useYFormatter": true,
    "useXFormatter": false,
    "yFormatterType": "number",
    "xFormatterType": "string",
    "customYFormatter": "",
    "customXFormatter": ""
  },
  "axisConfigs": [
    {
      "name": "Age",
      "dataColumn": "Age",
      "color": "#3b82f6",
      "visible": true,
      "lineWidth": 2,
      "pointRadius": 4,
      "lineStyle": "solid",
      "pointStyle": "circle",
      "opacity": 1
    },
    {
      "name": "Salary",
      "dataColumn": "Salary",
      "color": "#f97316",
      "visible": true,
      "lineWidth": 2,
      "pointRadius": 4,
      "lineStyle": "solid",
      "pointStyle": "circle",
      "opacity": 1
    }
  ],
  "metadata": {
    "createdBy": "LineChartEditor",
    "lastModified": "2025-09-19T14:59:18.884Z",
    "editorVersion": "1.0"
  }
}'
WHERE id = 'e392f106-53ae-4c7a-8362-4def1fd3712c';

*/

export const SAMPLE_CHART_CONFIG_FOR_DATABASE = {
  version: '1.0',
  chartType: 'line',
  width: 800,
  height: 400,
  margin: {
    top: 20,
    right: 40,
    bottom: 60,
    left: 80,
  },
  title: 'First chart',
  xAxisKey: 'Name',
  xAxisLabel: 'Name',
  xAxisStart: 'auto',
  xAxisRotation: 0,
  yAxisKeys: ['Age', 'Salary'],
  yAxisLabel: 'Values',
  yAxisStart: 'auto',
  yAxisRotation: 0,
  showAxisLabels: true,
  showAxisTicks: true,
  showLegend: true,
  showGrid: true,
  showPoints: true,
  showTooltip: true,
  animationDuration: 1000,
  curve: 'curveMonotoneX',
  disabledLines: [],
  lineWidth: 2,
  pointRadius: 4,
  gridOpacity: 0.3,
  legendPosition: 'bottom',
  theme: 'auto',
  backgroundColor: 'transparent',
  titleFontSize: 16,
  labelFontSize: 12,
  legendFontSize: 11,
  enableZoom: false,
  enablePan: false,
  zoomExtent: 8,
  colors: {
    Age: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
    Salary: {
      light: '#f97316',
      dark: '#fb923c',
    },
  },
  formatters: {
    useYFormatter: true,
    useXFormatter: false,
    yFormatterType: 'number',
    xFormatterType: 'string',
    customYFormatter: '',
    customXFormatter: '',
  },
  axisConfigs: [
    {
      name: 'Age',
      dataColumn: 'Age',
      color: '#3b82f6',
      visible: true,
      lineWidth: 2,
      pointRadius: 4,
      lineStyle: 'solid',
      pointStyle: 'circle',
      opacity: 1,
    },
    {
      name: 'Salary',
      dataColumn: 'Salary',
      color: '#f97316',
      visible: true,
      lineWidth: 2,
      pointRadius: 4,
      lineStyle: 'solid',
      pointStyle: 'circle',
      opacity: 1,
    },
  ],
  metadata: {
    createdBy: 'LineChartEditor',
    lastModified: '2025-09-19T14:59:18.884Z',
    editorVersion: '1.0',
  },
};
