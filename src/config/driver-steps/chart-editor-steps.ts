import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const chartEditorSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Rocket} Welcome to Chart Editor`,
      description:
        "Create stunning visualizations with our powerful editor. Let's take a quick tour of the main features to get you started.",
      align: 'center',
    },
  },
  {
    element: '#chart-type-selector',
    popover: {
      title: `${Icons.BarChart3} Choose Your Chart`,
      description:
        'Start by selecting the perfect chart type for your data. From simple lines to complex heatmaps, we have it all.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#series-management-section',
    popover: {
      title: `${Icons.Database} Manage Data Series`,
      description:
        'Add, remove, and customize your data series here. Control exactly what data appears on your chart.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#chart-settings-section',
    popover: {
      title: `${Icons.Settings} Customize Appearance`,
      description:
        'Fine-tune every detail. Adjust colors, axes, legends, and animations to match your style perfectly.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#save-chart-button',
    popover: {
      title: `${Icons.Save} Save & Share`,
      description:
        'Ready to go? Save your masterpiece to your workspace or export it to share with your team.',
      side: 'bottom',
      align: 'end',
    },
  },
];
