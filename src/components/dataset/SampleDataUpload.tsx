import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileSpreadsheet,
  LineChart,
  BarChart3,
  AreaChart,
  Dot,
  ChartPie,
  Donut,
} from 'lucide-react';
import { FadeIn } from '@/theme/animation';
import { ChartType } from '@/features/charts';
import { getSampleCSVForChartType } from '@/data/generatedSamples';
import { useTranslation } from 'react-i18next';

interface SampleDataUploadProps {
  onSampleSelect: (content: string) => void;
}

function SampleDataUpload({ onSampleSelect }: SampleDataUploadProps) {
  const { t } = useTranslation();
  const chartOptions: Array<{ id: ChartType; name: string; description: string; icon: any }> = [
    {
      id: ChartType.Line,
      name: t('sample_line_chart'),
      description: t('sample_line_chart_desc'),
      icon: LineChart,
    },
    {
      id: ChartType.Bar,
      name: t('sample_bar_chart'),
      description: t('sample_bar_chart_desc'),
      icon: BarChart3,
    },
    {
      id: ChartType.Area,
      name: t('sample_area_chart'),
      description: t('sample_area_chart_desc'),
      icon: AreaChart,
    },
    {
      id: ChartType.Scatter,
      name: t('sample_scatter_chart'),
      description: t('sample_scatter_chart_desc'),
      icon: Dot,
    },
    {
      id: ChartType.Pie,
      name: t('sample_pie_chart'),
      description: t('sample_pie_chart_desc'),
      icon: ChartPie,
    },
    {
      id: ChartType.Donut,
      name: t('sample_donut_chart'),
      description: t('sample_donut_chart_desc'),
      icon: Donut,
    },
  ];

  const handleGenerate = (type: ChartType) => {
    const csv = getSampleCSVForChartType(type, 36);
    onSampleSelect(csv);
  };

  return (
    <FadeIn>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            {t('sample_data_title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('sample_data_description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {chartOptions.map(opt => {
              const IconComponent = opt.icon;
              return (
                <div
                  key={opt.id}
                  className="p-4 border rounded-lg cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  onClick={() => handleGenerate(opt.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {opt.name}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default SampleDataUpload;
