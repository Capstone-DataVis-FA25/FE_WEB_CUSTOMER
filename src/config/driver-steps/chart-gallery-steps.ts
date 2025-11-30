import type { DriveStep } from 'driver.js';

export const chartGallerySteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Welcome to Chart Gallery! 🎨</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Choose from dozens of beautiful chart templates. Let me show you how to find the perfect chart for your data!</p>",
      side: 'over',
    },
  },
  {
    element: '#dataset-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>💾 Select Your Dataset</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Choose a dataset to work with, or skip to use sample data. You can change this later in the chart editor.</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#search-templates',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔍 Quick Search</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Type keywords to instantly find specific chart templates. Try searching for 'bar', 'line', or 'comparison'!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#featured-filter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>⭐ Featured Templates</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Show only our handpicked featured templates - the most popular and versatile chart types!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#category-filter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📂 Filter by Category</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Browse charts organized by category: Basic Charts, Advanced Charts, Statistical, Business, and more!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#type-filter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📊 Filter by Chart Type</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Filter by specific chart types like Line, Bar, Area, Pie, and many more. Each type is perfect for different data stories!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#purpose-filter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎯 Filter by Purpose</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Choose charts by their purpose: Comparison, Distribution, Change Over Time, Correlation, or Geographical data visualization.</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#templates-grid',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🖼️ Template Gallery</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Browse all available chart templates. Click on any template to preview and select it for your visualization!</p>",
      side: 'left',
      align: 'start',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Start Creating! 🚀</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>You're ready to create stunning visualizations! Select a template and start customizing your chart.</p>",
      side: 'over',
    },
  },
];
