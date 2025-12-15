import type { DriveStep } from 'driver.js';
import { Icons } from './icons';
import { t } from './i18n-helper';

export const chartEditorSteps: DriveStep[] = [
  {
    popover: {
      title: `${Icons.Rocket} ${t('tour_editor_welcome_title')}`,
      description: t('tour_editor_welcome_desc'),
      align: 'center',
    },
  },
  {
    element: '#chart-type-selector',
    popover: {
      title: `${Icons.BarChart3} ${t('tour_editor_type_title')}`,
      description: t('tour_editor_type_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#basic-settings-section',
    popover: {
      title: `${Icons.Settings} ${t('tour_editor_basic_title')}`,
      description: t('tour_editor_basic_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#series-management-section',
    popover: {
      title: `${Icons.Database} ${t('tour_editor_series_title')}`,
      description: t('tour_editor_series_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#chart-settings-section',
    popover: {
      title: `${Icons.Settings} ${t('tour_editor_settings_title')}`,
      description: t('tour_editor_settings_desc'),
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#chart-preview-container',
    popover: {
      title: `${Icons.Eye} ${t('tour_editor_preview_title')}`,
      description: t('tour_editor_preview_desc'),
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '#btn-save-chart',
    popover: {
      title: `${Icons.Save} ${t('tour_editor_save_title')}`,
      description: t('tour_editor_save_desc'),
      side: 'bottom',
      align: 'end',
    },
  },
];
