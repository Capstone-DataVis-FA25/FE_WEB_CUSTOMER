import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const getDatasetListSteps = (): DriveStep[] => [
  {
    popover: {
      title: `${Icons.Database} ${t('tour_dataset_welcome_title')}`,
      description: t('tour_dataset_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#btn-new-dataset',
    popover: {
      title: `${Icons.Upload} ${t('tour_dataset_create_title')}`,
      description: t('tour_dataset_create_desc'),
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#search-dataset',
    popover: {
      title: `${Icons.Sparkles} ${t('tour_dataset_search_title')}`,
      description: t('tour_dataset_search_desc'),
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#dataset-card-0',
    popover: {
      title: `${Icons.LayoutDashboard} ${t('tour_dataset_actions_title')}`,
      description: t('tour_dataset_actions_desc'),
      side: 'right',
      align: 'center',
    },
  },
];

export const getCreateDatasetSteps = (): DriveStep[] => [
  {
    popover: {
      title: `${Icons.Upload} ${t('tour_dataset_import_title')}`,
      description: t('tour_dataset_import_desc'),
      align: 'center',
    },
  },
  {
    element: '#upload-method-nav',
    popover: {
      title: `${Icons.Settings} ${t('tour_dataset_method_title')}`,
      description: t('tour_dataset_method_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-btn-cleanDataset',
    popover: {
      title: `${Icons.Wand2} ${t('tour_dataset_ai_title')}`,
      description: t('tour_dataset_ai_desc'),
      side: 'right',
      align: 'center',
    },
  },
];
