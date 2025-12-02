import type { DriveStep } from 'driver.js';
import { Icons } from './icons';

export const homeSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Rocket} Welcome to DataVis`,
      description:
        "Create beautiful, responsive charts with no coding required. Let's explore what makes DataVis special.",
      align: 'center',
    },
  },
  {
    element: '#hero-cta-build-chart',
    popover: {
      title: `${Icons.BarChart3} Build Your First Chart`,
      description: 'Start here! Create custom charts from your data with our intuitive editor.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-types-section',
    popover: {
      title: `${Icons.LayoutDashboard} Explore Templates`,
      description:
        'Discover our collection of professional chart templates. Click to preview and learn more.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#features-section',
    popover: {
      title: `${Icons.Sparkles} Powerful Features`,
      description:
        'Everything you need: customization, collaboration, and export options in one platform.',
      side: 'top',
      align: 'center',
    },
  },
];
