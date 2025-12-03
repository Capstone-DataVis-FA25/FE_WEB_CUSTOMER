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
      title: `${Icons.BarChart3} Choose Chart Type`,
      description:
        'Start by selecting the perfect chart type for your data. We offer a wide range of options from simple bars to complex heatmaps.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#basic-settings-section',
    popover: {
      title: `${Icons.Settings} Basic Configuration`,
      description:
        'Configure the fundamental aspects of your chart, such as orientation and basic layout options.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#series-management-section',
    popover: {
      title: `${Icons.Database} Manage Data Series`,
      description:
        'Control your data here. Add or remove series, and map your dataset columns to chart axes.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#chart-settings-section',
    popover: {
      title: `${Icons.Settings} Customize Appearance`,
      description:
        'Fine-tune the look and feel. Adjust colors, labels, legends, and other visual properties to match your style.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#chart-preview-container',
    popover: {
      title: `${Icons.Eye} Live Preview`,
      description:
        'See your changes in real-time. This interactive preview shows exactly how your chart will look.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '#btn-save-chart',
    popover: {
      title: `${Icons.Save} Save Your Work`,
      description:
        'Once you are happy with your chart, click here to save it to your workspace. You can then share it or use it in dashboards.',
      side: 'bottom',
      align: 'end',
    },
  },
];
