import { AnimatePresence, motion } from '@/theme/animation';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Camera, ChevronDown, ChevronUp, Download, Settings, Upload } from 'lucide-react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import useToast from '@/hooks/useToast';
import { useChartEditor, useChartEditorRead } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import { useState } from 'react';
import ToastContainer from '../ui/toast-container';

const ImportExportSection = () => {
  const { t } = useTranslation();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const { chartConfig } = useChartEditorRead();
  const {
    currentChartType: chartType,
    editableName,
    editableDescription,
    setCurrentChartType,
    setChartConfig,
    setEditableName,
    setEditableDescription,
    updateOriginals,
  } = useChartEditor();

  const { getDatasetById, currentDataset } = useDataset();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Toggle import/export section visibility
  const toggleSection = () => {
    setIsCollapsed(prev => !prev);
  };

  // Export chart as image (PNG, JPEG, SVG)
  const exportChartAsImage = async (format: 'png' | 'jpeg' | 'svg' = 'png') => {
    try {
      // Find the SVG element within the chart container
      const chartContainer = document.querySelector('.chart-container');
      const svgElement = chartContainer?.querySelector('svg') || document.querySelector('svg');

      if (!svgElement) {
        showError('Chart not found for export');
        return;
      }

      // Get chart title for filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${chartType}-${timestamp}`;

      if (format === 'svg') {
        // Export as SVG - preserve vector format
        const svgData = new XMLSerializer().serializeToString(svgElement);

        // Clean up the SVG and add proper styling
        const cleanSvgData = svgData.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');

        const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const a = document.createElement('a');
        a.href = svgUrl;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(svgUrl);

        showSuccess(`Chart exported as SVG`);
      } else {
        // Export as raster image (PNG/JPEG)
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            showError('Cannot create canvas for image export');
            return;
          }

          // Clone SVG and ensure it has proper dimensions
          const svgClone = svgElement.cloneNode(true) as SVGElement;

          // Get actual dimensions
          const svgWidth = svgElement.clientWidth || 800;
          const svgHeight = svgElement.clientHeight || 600;
          const scaleFactor = 2; // For better quality

          // Set canvas size
          canvas.width = svgWidth * scaleFactor;
          canvas.height = svgHeight * scaleFactor;
          ctx.scale(scaleFactor, scaleFactor);

          // Set explicit dimensions on cloned SVG
          svgClone.setAttribute('width', svgWidth.toString());
          svgClone.setAttribute('height', svgHeight.toString());
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

          // Set background color for JPEG
          if (format === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, svgWidth, svgHeight);
          }

          // Convert SVG to data URL using helper function
          const svgDataUrl = createSVGDataURL(svgElement);

          const img = new Image();
          img.crossOrigin = 'anonymous'; // Enable CORS

          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

              // Convert canvas to blob and download
              canvas.toBlob(
                blob => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showSuccess(`Chart exported as ${format.toUpperCase()}`);
                  } else {
                    showError('Cannot create image file');
                  }
                },
                `image/${format}`,
                format === 'jpeg' ? 0.9 : 1.0
              );
            } catch (drawError) {
              showError('Error drawing chart on canvas: ' + drawError);
            }
          };

          img.onerror = () => {
            showError(`${format.toUpperCase()} export failed. Please try SVG export instead.`);
          };

          // Set timeout for image loading
          setTimeout(() => {
            if (!img.complete) {
              showError('Timeout loading chart. Please try again or export as SVG.');
            }
          }, 5000);

          img.src = svgDataUrl;
        } catch (canvasError) {
          showError(
            `Error exporting as ${format.toUpperCase()}: ${canvasError}. Please try SVG export instead.`
          );
        }
      }
    } catch (error) {
      showError('Error exporting chart: ' + (error as Error).message);
    }
  };

  // Helper function to create better SVG data URL
  const createSVGDataURL = (svgElement: SVGElement): string => {
    const svgClone = svgElement.cloneNode(true) as SVGElement;

    // Ensure SVG has proper dimensions and namespace
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;

    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Get all styles and ensure they're embedded
    const stylesheets = Array.from(document.styleSheets);
    let styles = '';

    stylesheets.forEach(stylesheet => {
      try {
        const rules = Array.from(stylesheet.cssRules);
        rules.forEach(rule => {
          if (rule.cssText.includes('svg') || rule.cssText.includes('.chart')) {
            styles += rule.cssText + '\n';
          }
        });
      } catch {
        // Cross-origin stylesheets might cause errors
      }
    });

    if (styles) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      svgClone.insertBefore(styleElement, svgClone.firstChild);
    }

    const svgString = new XMLSerializer().serializeToString(svgClone);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  // Export configuration to JSON (includes all chart metadata)
  const exportConfigToJSON = () => {
    try {
      if (!chartConfig) {
        showError('No configuration to export');
        return;
      }

      if (!chartType) {
        showError('Unknown chart type');
        return;
      }

      const exportData = {
        name: editableName || 'Untitled Chart',
        description: editableDescription,
        type: chartType,
        datasetId: currentDataset?.id || '',
        config: chartConfig,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const fileName = editableName || 'chart';
      a.download = `${fileName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(t('chart_editor_configExported', 'Configuration exported'));
    } catch (error) {
      showError(t('chart_editor_invalidConfigFile', 'Export failed'));
    }
  };

  // Import configuration from JSON
  const importConfigFromJSON = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async event => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importData = JSON.parse(text);

          // Validate the imported data structure
          if (!importData.config) {
            throw new Error('Invalid configuration file structure');
          }

          // Import all chart properties
          if (importData.name) {
            setEditableName(importData.name);
          }
          if (importData.description !== undefined) {
            setEditableDescription(importData.description || '');
          }
          if (importData.type) {
            setCurrentChartType(importData.type);
          }
          if (importData.config) {
            setChartConfig(importData.config);
          }
          if (importData.datasetId) {
            getDatasetById(importData.datasetId);
          }
          // Note: datasetId is imported but requires manual dataset selection
          // as we don't automatically load datasets during config import

          showSuccess(t('chart_editor_configImported', 'Configuration imported successfully'));
        } catch (parseError) {
          showError(t('chart_editor_invalidConfigFile', 'Invalid configuration file'));
        }
      };
      input.click();
    } catch (error) {
      showError(t('chart_editor_invalidConfigFile', 'Import failed'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
          onClick={toggleSection}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('chart_editor_chart_actions', 'Import / Export & More')}
            </h3>
            {isCollapsed ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence mode="wait">
          {isCollapsed && (
            <motion.div
              key="basic-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                {/* Export Image Section */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    {t('chart_editor_export_image', 'Export Image')}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => exportChartAsImage('png')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                    >
                      <Download className="h-3 w-3" />
                      PNG
                    </Button>
                    <Button
                      onClick={() => exportChartAsImage('jpeg')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
                    >
                      <Download className="h-3 w-3" />
                      JPEG
                    </Button>
                    <Button
                      onClick={() => exportChartAsImage('svg')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                    >
                      <Download className="h-3 w-3" />
                      SVG
                    </Button>
                  </div>
                </div>

                {/* Config Management Section */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t('chart_editor_config_management', 'Config Management')}
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={exportConfigToJSON}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2 text-xs justify-start bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-400"
                    >
                      <Download className="h-3 w-3" />
                      {t('chart_editor_export_config', 'Export Config JSON')}
                    </Button>
                    <Button
                      onClick={importConfigFromJSON}
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2 text-xs justify-start bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                    >
                      <Upload className="h-3 w-3" />
                      {t('chart_editor_import_config', 'Import Config JSON')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </motion.div>
  );
};

export default ImportExportSection;
