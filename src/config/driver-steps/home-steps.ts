import type { DriveStep } from 'driver.js';

export const homeSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.75rem;'>Welcome to DataVis! 🎨</span>",
      description:
        "<p style='font-size: 1.2rem; line-height: 1.7; color: #64748b;'>Create beautiful, responsive charts with no coding required. Let me show you what makes DataVis special!</p>",
      side: 'over',
    },
  },
  {
    element: '#hero-cta-build-chart',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>🚀 Build Your First Chart</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Start your visualization journey here! Click this button to create custom charts from your data. No technical skills needed – our intuitive editor guides you every step of the way.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-types-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>📊 Explore Chart Types</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Discover our collection of professional chart templates! From line and bar charts to maps and tables – click any icon to see a live preview and learn what each chart type is best for.</p>",
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#features-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600; font-size: 1.3rem;'>✨ Powerful Features</span>",
      description:
        "<p style='color: #475569; line-height: 1.6; font-size: 1.05rem;'>Everything you need for data visualization: unlimited customization, beautiful design system, team collaboration, mobile responsiveness, and powerful export options. All in one platform!</p>",
      side: 'top',
      align: 'center',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.75rem;'>Ready to Create! 🎉</span>",
      description:
        "<p style='font-size: 1.2rem; line-height: 1.7; color: #64748b;'>You're all set! Start by uploading your data or try our sample datasets. Happy visualizing!</p>",
      side: 'over',
    },
  },
];
