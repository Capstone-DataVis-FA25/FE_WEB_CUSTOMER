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

interface SampleDataUploadProps {
  onSampleSelect: (content: string) => void;
}

function SampleDataUpload({ onSampleSelect }: SampleDataUploadProps) {
  const chartOptions: Array<{ id: ChartType; name: string; description: string; icon: any }> = [
    {
      id: ChartType.Line,
      name: 'Line Chart Sample',
      description:
        'Follow a 3‑year journey of regional sales where seasons drive predictable peaks and dips, and each region (North, South, East, West, Central) pushes the total forward.',
      icon: LineChart,
    },
    {
      id: ChartType.Bar,
      name: 'Bar Chart Sample',
      description:
        'Compare how each product SKU performs across regions and channels—online, retail, and wholesale—then see how returns reshape the final net story.',
      icon: BarChart3,
    },
    {
      id: ChartType.Area,
      name: 'Area Chart Sample',
      description:
        'Watch regions stack together month by month as seasonal demand swells and fades, showing how each area lifts the total over time.',
      icon: AreaChart,
    },
    {
      id: ChartType.Scatter,
      name: 'Scatter Chart Sample',
      description:
        'Explore a housing market snapshot where larger homes in pricier cities command higher prices while beds, baths, and age bend the trendline.',
      icon: Dot,
    },
    {
      id: ChartType.Pie,
      name: 'Pie Chart Sample',
      description:
        'See how a marketing budget fragments across channels and how that spend converts into attention, clicks, and ultimately conversions.',
      icon: ChartPie,
    },
    {
      id: ChartType.Donut,
      name: 'Donut Chart Sample',
      description:
        'A ringed view of the marketing mix—compare slices at a glance and read the story of reach, engagement, and outcomes by channel.',
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
            Try Sample Data
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Generated samples based on chart type. Previous static samples are hidden.
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
