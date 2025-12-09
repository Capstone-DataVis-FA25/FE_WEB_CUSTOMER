import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const homeSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Rocket} ${t('tour_home_welcome_title')}`,
      description: t('tour_home_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#hero-cta-build-chart',
    popover: {
      title: `${Icons.BarChart3} ${t('tour_home_build_title')}`,
      description: t('tour_home_build_desc'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-types-section',
    popover: {
      title: `${Icons.LayoutDashboard} ${t('tour_home_templates_title')}`,
      description: t('tour_home_templates_desc'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#features-section',
    popover: {
      title: `${Icons.Sparkles} ${t('tour_home_features_title')}`,
      description: t('tour_home_features_desc'),
      side: 'top',
      align: 'center',
    },
  },
];
