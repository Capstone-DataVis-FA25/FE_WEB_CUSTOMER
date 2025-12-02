import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const datasetListSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Database} Welcome to Datasets`,
      description: 'Manage your data efficiently. This is your central hub for all your datasets.',
      align: 'center',
    },
  },
  {
    element: '#btn-new-dataset',
    popover: {
      title: `${Icons.Upload} Create New Dataset`,
      description: 'Upload files, paste data, or use AI to clean messy data. Get started here.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-dataset',
    popover: {
      title: `${Icons.Sparkles} Find & Organize`,
      description: 'Quickly search and sort your datasets to find exactly what you need.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#dataset-card-0',
    popover: {
      title: `${Icons.LayoutDashboard} Dataset Actions`,
      description: 'View details, edit, or create charts directly from your dataset card.',
      side: 'right',
      align: 'center',
    },
  },
];

export const createDatasetSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Upload} Import Your Data`,
      description:
        'Choose how you want to bring your data in. We support multiple formats and methods.',
      align: 'center',
    },
  },
  {
    element: '#upload-method-nav',
    popover: {
      title: `${Icons.Settings} Choose Method`,
      description: 'Upload files, paste text, use sample data, or let AI clean your data for you.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-btn-cleanDataset',
    popover: {
      title: `${Icons.Wand2} AI Data Cleaning`,
      description: 'Got messy data? Let our AI assistant clean and format it automatically.',
      side: 'right',
      align: 'center',
    },
  },
];
