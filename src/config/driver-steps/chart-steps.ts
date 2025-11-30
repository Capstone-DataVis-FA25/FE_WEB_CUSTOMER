import type { DriveStep } from 'driver.js';

export const chartListSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Welcome to Charts! 📊</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Manage and visualize your data with powerful chart tools. Let me show you around!</p>",
      side: 'over',
    },
  },
  {
    element: '#btn-new-chart',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🚀 Create New Chart</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Start visualizing your data! Click here to create a new chart from your datasets. Choose from line, bar, area, and more chart types.</p>",
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-chart',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔍 Quick Search</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Find your charts instantly by typing their name or description. Perfect for managing large chart collections!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#sortOrder',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>⏱️ Sort Options</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Sort your charts by newest or oldest to easily find what you're looking for.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#updatedAtFrom',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📅 Date Range Filter</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Filter charts by their last update date. Select a date range to narrow down your search and find specific charts.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#chartTypeFilter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📈 Filter by Chart Type</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Filter your charts by type (Line, Bar, Area, etc.) to quickly find the visualization you need.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#datasetFilter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>💾 Filter by Dataset</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Filter charts by their source dataset to see all visualizations created from a specific data source.</p>",
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '#chart-card-0',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>✨ Your Chart Card</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Each card shows your chart preview and details. Click to view, use the menu to edit, duplicate, or delete. The three-dot menu gives you quick access to all actions!</p>",
      side: 'right',
      align: 'center',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>You're All Set! 🎉</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Now you know how to manage your charts like a pro! Start creating beautiful visualizations.</p>",
      side: 'over',
    },
  },
];
