import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Upload } from 'lucide-react';
import { FadeIn } from '@/theme/animation';
import { useDatasetUpload } from '@/contexts/DatasetUploadContext';

interface TextUploadProps {
  onTextProcess: (textContent: string) => void;
  isProcessing?: boolean;
}

function TextUpload({ onTextProcess, isProcessing = false }: TextUploadProps) {
  const { t: _t } = useTranslation();
  const { originalTextContent, setOriginalTextContent } = useDatasetUpload();

  const handleProcess = () => {
    if (!originalTextContent.trim()) {
      return;
    }
    onTextProcess(originalTextContent);
  };

  const handleSampleData = () => {
    const sampleData = `Name,Age,City,Salary,Country
John Doe,28,New York,"1,234.56",USA
Jane Smith,34,London,"2,890.75",UK
Mike Johnson,45,Toronto,"3,567.90",Canada
Sarah Williams,29,Sydney,"1,987.25",Australia
David Brown,38,Berlin,"4,123.80",Germany
Lisa Garcia,31,Madrid,"2,456.40",Spain
Tom Wilson,42,Tokyo,"5,678.95",Japan`;
    setOriginalTextContent(sampleData);
  };

  return (
    <FadeIn>
      <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Text Input
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Paste your tabular data directly as text. Supports CSV, TSV, and other delimited
            formats.
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
                  Paste your data here
                </Label>
                <textarea
                  id="textContent"
                  value={originalTextContent}
                  onChange={e => setOriginalTextContent(e.target.value)}
                  placeholder='Name,Age,City,Salary,Country&#10;John Doe,28,New York,"1,234.56",USA&#10;Jane Smith,34,London,"2,890.75",UK&#10;Mike Johnson,45,Toronto,"3,567.90",Canada'
                  className="w-full min-h-[300px] p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tip: Use the first row as headers for better data organization
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleSampleData}
              disabled={isProcessing}
              className="px-6 py-3 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-400"
            >
              Load Sample Data
            </Button>
            <Button
              onClick={handleProcess}
              disabled={!originalTextContent.trim() || isProcessing}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Process Text'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

export default TextUpload;
