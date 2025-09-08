import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { FadeIn } from '@/theme/animation';
import { sampleDatasets, type SampleDataset } from '@/data/sampleDatasets';

interface SampleDataUploadProps {
  onSampleSelect: (content: string) => void;
}

function SampleDataUpload({ onSampleSelect }: SampleDataUploadProps) {
  const handleSampleSelect = async (sample: SampleDataset) => {
    try {
      if (sample.fetchUrl) {
        const res = await fetch(sample.fetchUrl);
        const text = await res.text();
        onSampleSelect(text);
      } else if (sample.data) {
        const csvString = sample.data.map(row => row.join(',')).join('\n');
        onSampleSelect(csvString);
      }
    } catch {
      // no-op
    }
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
            Explore the platform with real, locally stored sample datasets.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {sampleDatasets.map(sample => {
              const IconComponent = sample.icon;
              return (
                <div
                  key={sample.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600`}
                  onClick={() => handleSampleSelect(sample)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          {sample.name}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                          {sample.description}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Source:</span>
                          <a
                            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                            href={sample.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            {sample.source}
                          </a>
                        </div>
                      </div>
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


