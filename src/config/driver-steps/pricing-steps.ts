import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const pricingSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.CreditCard} ${t('tour_pricing_welcome_title')}`,
      description: t('tour_pricing_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#pricing-plans-grid',
    popover: {
      title: `${Icons.LayoutDashboard} ${t('tour_pricing_compare_title')}`,
      description: t('tour_pricing_compare_desc'),
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '.pricing-plan-features:first-child',
    popover: {
      title: `${Icons.Sparkles} ${t('tour_pricing_features_title')}`,
      description: t('tour_pricing_features_desc'),
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '.pricing-subscribe-button:first-child',
    popover: {
      title: `${Icons.Rocket} ${t('tour_pricing_subscribe_title')}`,
      description: t('tour_pricing_subscribe_desc'),
      side: 'top',
      align: 'center',
    },
  },
];
