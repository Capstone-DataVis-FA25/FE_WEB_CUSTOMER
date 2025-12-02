import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const chartGallerySteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Palette} Chart Gallery`,
      description:
        'Choose from dozens of beautiful chart templates. Find the perfect one for your data.',
      align: 'center',
    },
  },
  {
    element: '#dataset-section',
    popover: {
      title: `${Icons.Database} Select Dataset`,
      description: 'Choose a dataset to work with, or skip to use sample data.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#category-filter',
    popover: {
      title: `${Icons.Sliders} Filter Options`,
      description:
        'Narrow down your choices by category, type, or purpose to find exactly what you need.',
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#templates-grid',
    popover: {
      title: `${Icons.LayoutDashboard} Template Gallery`,
      description: 'Browse our collection. Click any template to preview and start creating.',
      side: 'left',
      align: 'start',
    },
  },
];
