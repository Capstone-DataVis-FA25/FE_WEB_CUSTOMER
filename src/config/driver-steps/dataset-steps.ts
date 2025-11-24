import type { DriveStep } from 'driver.js';

export const datasetListSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Welcome to Datasets! 💾</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Your data is the foundation of great visualizations. Let's explore how to manage your datasets effectively!</p>",
      side: 'over',
    },
  },
  {
    element: '#btn-new-dataset',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>➕ Create New Dataset</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Upload CSV, Excel files, or paste your data directly. You can also use our sample datasets to get started quickly!</p>",
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-dataset',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔎 Search Datasets</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Quickly find any dataset by typing its name or description. Essential for managing multiple data sources!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#sortOrder',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔄 Sort Your Data</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Sort datasets by newest or oldest to organize your data library efficiently.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#createdAtFrom',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📆 Date Range Filter</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Filter datasets by creation date to find data from specific time periods. Great for tracking data imports over time!</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#dataset-card-0',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📋 Dataset Card</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>View dataset details including row count and columns. Use the action menu to edit, delete, or create charts directly from your data!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Ready to Visualize! 🚀</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>You now know how to manage datasets. Start uploading your data and creating amazing charts!</p>",
      side: 'over',
    },
  },
];

export const createDatasetSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Create Your Dataset 📊</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Multiple ways to import your data! Let's explore all the options available to you.</p>",
      side: 'over',
    },
  },
  {
    element: '#upload-method-nav',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📂 Choose Upload Method</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Select how you want to import your data. We support multiple methods: File Upload, Copy/Paste, Sample Data, and AI Cleaning for messy data!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-btn-upload',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📤 File Upload</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Upload CSV, Excel (XLSX), or JSON files directly from your computer. Drag and drop supported!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#nav-btn-textUpload',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📝 Paste Data</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Copy data from spreadsheets or other sources and paste it directly. Perfect for quick imports!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#nav-btn-sampleData',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎲 Sample Data</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Don't have data yet? Try our sample datasets to explore the platform and learn chart creation!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#nav-btn-cleanDataset',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🤖 AI Data Cleaning</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Got messy data? Our AI tools automatically clean, format, and structure your data for perfect visualizations!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Start Importing! 🎯</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Choose your preferred method and start importing your data. We'll guide you through each step!</p>",
      side: 'over',
    },
  },
];
