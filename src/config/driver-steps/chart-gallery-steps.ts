import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const getChartGallerySteps = (): DriveStep[] => [
  {
    popover: {
      title: `${Icons.Palette} ${t('tour_gallery_welcome_title')}`,
      description: t('tour_gallery_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#dataset-section',
    popover: {
      title: `${Icons.Database} ${t('tour_gallery_dataset_title')}`,
      description: t('tour_gallery_dataset_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#category-filter',
    popover: {
      title: `${Icons.Sliders} ${t('tour_gallery_filter_title')}`,
      description: t('tour_gallery_filter_desc'),
      side: 'right',
      align: 'center',
    },
  },
  {
    element: '#templates-grid',
    popover: {
      title: `${Icons.LayoutDashboard} ${t('tour_gallery_templates_title')}`,
      description: t('tour_gallery_templates_desc'),
      side: 'left',
      align: 'start',
    },
  },
];
