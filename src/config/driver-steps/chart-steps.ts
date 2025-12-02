import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const chartListSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.BarChart3} Welcome to Charts`,
      description:
        'Manage and visualize your data. This is your personal dashboard for all your charts.',
      align: 'center',
    },
  },
  {
    element: '#btn-new-chart',
    popover: {
      title: `${Icons.Rocket} Create New Chart`,
      description: 'Start visualizing! Create a new chart from your datasets with just one click.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-chart',
    popover: {
      title: `${Icons.Sparkles} Find & Filter`,
      description:
        'Use search and filters to quickly locate specific charts by name, type, or date.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-card-0',
    popover: {
      title: `${Icons.LayoutDashboard} Chart Actions`,
      description: 'View, edit, duplicate, or delete your charts directly from the card menu.',
      side: 'right',
      align: 'center',
    },
  },
];
