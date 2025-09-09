import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useChartCreation } from '@/contexts/ChartCreationContext';
import { 
  Settings,
  Palette,
  Grid,
  Eye,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import type { ChartType, ChartConfiguration } from '@/contexts/ChartCreationContext';

interface ChartConfigurationStepProps {
  onNext: () => void;
  onPrevious: () => void;
  chartType: ChartType | null;
}

// Color themes
const colorThemes = [
  {
    name: 'Default',
    colors: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']
  },
  {
    name: 'Ocean',
    colors: ['#0EA5E9', '#0891B2', '#0F766E', '#059669', '#047857']
  },
  {
    name: 'Sunset',
    colors: ['#F59E0B', '#EF4444', '#DC2626', '#B91C1C', '#991B1B']
  },
  {
    name: 'Forest',
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B']
  },
  {
    name: 'Purple',
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95']
  }
];

function ChartConfigurationStep({ onNext, onPrevious, chartType }: ChartConfigurationStepProps) {
  const { t } = useTranslation();
  const { chartConfiguration, updateChartConfiguration } = useChartCreation();
  
  // Local form state
  const [formData, setFormData] = useState<ChartConfiguration>(chartConfiguration);
  const [selectedTheme, setSelectedTheme] = useState(0);

  // Update context when form data changes
  useEffect(() => {
    updateChartConfiguration(formData);
  }, [formData, updateChartConfiguration]);

  // Handle input changes
  const handleInputChange = (field: keyof ChartConfiguration, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle theme selection
  const handleThemeSelect = (themeIndex: number) => {
    setSelectedTheme(themeIndex);
    handleInputChange('colors', colorThemes[themeIndex].colors);
  };

  // Check if form is valid
  const isFormValid = formData.title.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('chart_creation_configuration_title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('chart_creation_configuration_subtitle', { chartTypeName: chartType?.name || 'chart' })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t('chart_config_basic_settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">{t('chart_config_title')} *</Label>
              <Input
                id="title"
                placeholder={t('chart_config_title_placeholder')}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={!formData.title.trim() ? 'border-red-300 mt-2' : 'mt-2'}
              />
              {!formData.title.trim() && (
                <p className="text-sm text-red-600 mt-1">{t('chart_config_title_required')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">{t('chart_config_description')}</Label>
              <Input
                className="mt-2"
                id="description"
                placeholder={t('chart_config_description_placeholder')}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">{t('chart_config_width')}</Label>
                <Input
                  className="mt-2"
                  id="width"
                  type="number"
                  min="300"
                  max="2000"
                  value={formData.width || 800}
                  onChange={(e) => handleInputChange('width', parseInt(e.target.value) || 800)}
                />
              </div>
              <div>
                <Label htmlFor="height">{t('chart_config_height')}</Label>
                <Input
                  className="mt-2"
                  id="height"
                  type="number"
                  min="200"
                  max="1200"
                  value={formData.height || 400}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || 400)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="xAxisTitle">{t('chart_config_x_axis_title')}</Label>
              <Input
                className="mt-2"
                id="xAxisTitle"
                placeholder={t('chart_config_x_axis_placeholder')}
                value={formData.xAxisTitle || ''}
                onChange={(e) => handleInputChange('xAxisTitle', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="yAxisTitle">{t('chart_config_y_axis_title')}</Label>
              <Input
                className="mt-2"
                id="yAxisTitle"
                placeholder={t('chart_config_y_axis_placeholder')}
                value={formData.yAxisTitle || ''}
                onChange={(e) => handleInputChange('yAxisTitle', e.target.value)}
              />
            </div>

            {/* Axis Start Configuration */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label className="text-base font-semibold">{t('chart_config_axis_configuration')}</Label>
              
              {/* X-Axis Start */}
              <div>
                <Label htmlFor="xAxisStart">{t('chart_config_x_axis_start')}</Label>
                <div className="space-y-2 mt-2">
                  <select
                    id="xAxisStart"
                    value={typeof formData.xAxisStart === "number" ? "custom" : formData.xAxisStart || "auto"}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        handleInputChange('xAxisStart', 0);
                      } else {
                        handleInputChange('xAxisStart', e.target.value as "auto" | "zero");
                      }
                    }}
                    className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="auto">{t('chart_config_axis_auto')}</option>
                    <option value="zero">{t('chart_config_axis_zero')}</option>
                    <option value="custom">{t('chart_config_axis_custom')}</option>
                  </select>
                  
                  {typeof formData.xAxisStart === "number" && (
                    <Input
                      type="number"
                      value={formData.xAxisStart}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          handleInputChange('xAxisStart', value);
                        }
                      }}
                      placeholder={t('chart_config_axis_custom_placeholder')}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              </div>

              {/* Y-Axis Start */}
              <div>
                <Label htmlFor="yAxisStart">{t('chart_config_y_axis_start')}</Label>
                <div className="space-y-2 mt-2">
                  <select
                    id="yAxisStart"
                    value={typeof formData.yAxisStart === "number" ? "custom" : formData.yAxisStart || "auto"}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        handleInputChange('yAxisStart', 0);
                      } else {
                        handleInputChange('yAxisStart', e.target.value as "auto" | "zero");
                      }
                    }}
                    className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="auto">{t('chart_config_axis_auto')}</option>
                    <option value="zero">{t('chart_config_axis_zero')}</option>
                    <option value="custom">{t('chart_config_axis_custom')}</option>
                  </select>
                  
                  {typeof formData.yAxisStart === "number" && (
                    <Input
                      type="number"
                      value={formData.yAxisStart}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          handleInputChange('yAxisStart', value);
                        }
                      }}
                      placeholder={t('chart_config_axis_custom_placeholder')}
                      className="h-9 text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              {t('chart_config_appearance')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Color Theme Selection */}
            <div>
              <Label>{t('chart_config_color_theme')}</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {colorThemes.map((theme, index) => (
                  <div
                    key={theme.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTheme === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleThemeSelect(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{theme.name}</span>
                      <div className="flex space-x-1">
                        {theme.colors.slice(0, 5).map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-3">
              <Label>{t('chart_config_display_options')}</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showLegend"
                  checked={formData.showLegend || false}
                  onCheckedChange={(checked) => handleInputChange('showLegend', checked)}
                />
                <Label htmlFor="showLegend" className="text-sm">{t('chart_config_show_legend')}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showGrid"
                  checked={formData.showGrid || false}
                  onCheckedChange={(checked) => handleInputChange('showGrid', checked)}
                />
                <Label htmlFor="showGrid" className="text-sm flex items-center gap-1">
                  <Grid className="w-3 h-3" />
                  {t('chart_config_show_grid')}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="animation"
                  checked={formData.animation || false}
                  onCheckedChange={(checked) => handleInputChange('animation', checked)}
                />
                <Label htmlFor="animation" className="text-sm">{t('chart_config_enable_animations')}</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Configuration */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {t('chart_config_preview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('chart_config_preview_title')}</span> {formData.title || 'Untitled Chart'}
              </div>
              <div>
                <span className="font-medium">{t('chart_config_preview_type')}</span> {chartType?.name || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">{t('chart_config_preview_dimensions')}</span> {formData.width || 800} × {formData.height || 400}
              </div>
              <div>
                <span className="font-medium">{t('chart_config_preview_theme')}</span> {colorThemes[selectedTheme].name}
              </div>
              <div>
                <span className="font-medium">{t('chart_config_preview_x_axis')}</span> 
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded ml-1">
                  {formData.xAxisStart === "auto" ? t('chart_config_axis_auto') : 
                   formData.xAxisStart === "zero" ? t('chart_config_axis_zero') : 
                   `${t('chart_config_axis_custom')}: ${formData.xAxisStart}`}
                </span>
              </div>
              <div>
                <span className="font-medium">{t('chart_config_preview_y_axis')}</span>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded ml-1">
                  {formData.yAxisStart === "auto" ? t('chart_config_axis_auto') : 
                   formData.yAxisStart === "zero" ? t('chart_config_axis_zero') : 
                   `${t('chart_config_axis_custom')}: ${formData.yAxisStart}`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm pt-2">
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${formData.showLegend ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('chart_config_preview_legend')}
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${formData.showGrid ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('chart_config_preview_grid')}
              </span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${formData.animation ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('chart_config_preview_animation')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('chart_config_back_chart_type')}
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isFormValid}
          size="lg"
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('chart_config_continue_series')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ChartConfigurationStep;
