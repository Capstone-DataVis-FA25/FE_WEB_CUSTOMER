import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Upload } from 'lucide-react';
import { FadeIn } from '@/theme/animation';
import { useDataset } from '@/contexts/DatasetContext';

interface TextUploadProps {
  onTextProcess: (textContent: string) => void;
  isProcessing?: boolean;
}

function TextUpload({ onTextProcess, isProcessing = false }: TextUploadProps) {
  const { t } = useTranslation();
  const { originalTextContent, setOriginalTextContent } = useDataset();

  const handleProcess = () => {
    if (!originalTextContent.trim()) {
      return;
    }
    const normalized = originalTextContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .join('\n');
    onTextProcess(normalized);
  };

  const handleSampleData = () => {
    const sampleData =
      'ID,Name,Age,DateOfBirth,Salary,Bonus\n' +
      '1,John Doe,28,1997-05-14,1234.56,300\n' +
      '2,Jane Smith,34,1991-03-22,2890.75,500\n' +
      '3,Michael Lee,45,1980-08-10,3567.90,700\n' +
      '4,Sarah Kim,29,1996-01-30,1987.25,350\n' +
      '5,David Chen,38,1987-07-19,4123.80,600\n' +
      '6,Linda Park,31,1994-11-05,2456.40,400\n' +
      '7,Robert Brown,42,1983-09-12,5678.95,800';

    setOriginalTextContent(sampleData);
  };

  const handleJsonSampleData = () => {
    const jsonSampleData = `[
  ["Name", "Age", "City", "Salary", "Country"],
  ["John Doe", 28, "New York", "1,234.56", "USA"],
  ["Jane Smith", 34, "London", "2,890.75", "UK"],
  ["Mike Johnson", 45, "Toronto", "3,567.90", "Canada"],
  ["Sarah Williams", 29, "Sydney", "1,987.25", "Australia"],
  ["David Brown", 38, "Berlin", "4,123.80", "Germany"],
  ["Lisa Garcia", 31, "Madrid", "2,456.40", "Spain"],
  ["Tom Wilson", 42, "Tokyo", "5,678.95", "Japan"]
]`;
    setOriginalTextContent(jsonSampleData);
  };

  return (
    <FadeIn>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {t('textUpload_title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Paste your tabular data directly as text. Supports CSV, TSV, JSON (2D arrays), and other
            delimited formats.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Text Input Area */}
          <div
            className="relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300
              border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="textContent"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {t('textUpload_pasteLabel')}
                </Label>
                <textarea
                  id="textContent"
                  value={originalTextContent}
                  onChange={e => setOriginalTextContent(e.target.value)}
                  placeholder='CSV Format:&#10;Name,Age,City,Salary,Country&#10;John Doe,28,New York,"1,234.56",USA&#10;&#10;JSON Format (2D Array):&#10;[&#10;  ["Name", "Age", "City", "Salary", "Country"],&#10;  ["John Doe", 28, "New York", "1,234.56", "USA"]&#10;]'
                  className="w-full min-h-[300px] p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y focus:border-blue-200 dark:focus:border-blue-800 focus:outline-none"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('textUpload_tip')}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={handleSampleData}
              disabled={isProcessing}
              className="px-6 py-3 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400"
            >
              Load CSV Sample
            </Button>
            <Button
              variant="outline"
              onClick={handleJsonSampleData}
              disabled={isProcessing}
              className="px-6 py-3 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400"
            >
              Load JSON Sample
            </Button>
            <Button
              onClick={handleProcess}
              disabled={!originalTextContent.trim() || isProcessing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? t('textUpload_processing') : t('textUpload_process')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default TextUpload;
