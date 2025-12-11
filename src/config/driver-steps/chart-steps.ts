import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const chartListSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.BarChart3} ${t('tour_chart_welcome_title')}`,
      description: t('tour_chart_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#btn-new-chart',
    popover: {
      title: `${Icons.Rocket} ${t('tour_chart_create_title')}`,
      description: t('tour_chart_create_desc'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-chart',
    popover: {
      title: `${Icons.Sparkles} ${t('tour_chart_search_title')}`,
      description: t('tour_chart_search_desc'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-card-0',
    popover: {
      title: `${Icons.LayoutDashboard} ${t('tour_chart_actions_title')}`,
      description: t('tour_chart_actions_desc'),
      side: 'right',
      align: 'center',
    },
  },
];
