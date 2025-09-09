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
  const { t } = useTranslation();
  const { originalTextContent, setOriginalTextContent } = useDatasetUpload();

  const handleProcess = () => {
    if (!originalTextContent.trim()) {
      return;
    }
    onTextProcess(originalTextContent);
  };

  const handleSampleData = () => {
    const sampleData = 
    `ID,Age,Salary,Bonus
1,28,1234.56,300
2,34,2890.75,500
3,45,3567.90,700
4,29,1987.25,350
5,38,4123.80,600
6,31,2456.40,400
7,42,5678.95,800`;
    setOriginalTextContent(sampleData);
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
            {t('textUpload_description')}
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
                  placeholder={
`ID,Age,Salary,Bonus
1,28,1234.56,300
2,34,2890.75,500
3,45,3567.90,700
4,29,1987.25,350
5,38,4123.80,600
6,31,2456.40,400
7,42,5678.95,800`}
                  className="w-full min-h-[300px] p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('textUpload_tip')}
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
              {t('textUpload_loadSample')}
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
