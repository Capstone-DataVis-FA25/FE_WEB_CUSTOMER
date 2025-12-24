import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import useToast from '@/hooks/useToast';
import resourceUsageService, { type ResourceUsageResponse } from '@/services/resourceUsage.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Database, BarChart3, Sparkles, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ResourceUsageCardProps {
  className?: string;
  onWarning?: (warnings: string[]) => void;
}

const ResourceUsageCard: React.FC<ResourceUsageCardProps> = ({ className = '', onWarning }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<ResourceUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useToast();

  useEffect(() => {
    fetchUsage();
  }, []);

  useEffect(() => {
    if (data && data.warnings.length > 0) {
      onWarning?.(data.warnings);
      const warningMessages = data.warnings.map(w => {
        switch (w) {
          case 'datasets':
            return t('resource_usage.warnings.datasets');
          case 'charts':
            return t('resource_usage.warnings.charts');
          case 'aiRequests':
            return t('resource_usage.warnings.aiRequests');
          default:
            return t('resource_usage.warnings.generic', { key: w });
        }
      });
      showWarning(t('resource_usage.warning_title'), warningMessages.join(', '));
    }
  }, [data]);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const response = await resourceUsageService.getMyResourceUsage();
      setData(response);
    } catch (err: any) {
      console.error(err);
      showError(t('resource_usage.error_title'), err?.message || t('resource_usage.failed_load'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const resources = [
    {
      icon: Database,
      label: t('resource_usage.labels.datasets'),
      current: data.usage.datasetsCount,
      limit: data.limits.maxDatasets,
      percentage: data.percentage.datasets,
      key: 'datasets',
    },
    {
      icon: BarChart3,
      label: t('resource_usage.labels.charts'),
      current: data.usage.chartsCount,
      limit: data.limits.maxCharts,
      percentage: data.percentage.charts,
      key: 'charts',
    },
    {
      icon: Sparkles,
      label: t('resource_usage.labels.aiRequests'),
      current: data.usage.aiRequestsCount,
      limit: data.limits.maxAiRequests,
      percentage: data.percentage.aiRequests,
      key: 'aiRequests',
    },
  ];

  return (
    <Card className={`p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('resource_usage.title')}
        </h3>
        {data.subscriptionPlan && (
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {data.subscriptionPlan.name}
          </Badge>
        )}
      </div>

      {data.warnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {t('resource_usage.warning_title')}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t('resource_usage.warning_description')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {resources.map(resource => {
          const Icon = resource.icon;
          const isWarning = data.warnings.includes(resource.key);
          const isUnlimited = resource.limit === null || resource.limit === 0;

          return (
            <div key={resource.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${isWarning ? 'text-yellow-500' : 'text-blue-500'}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {resource.label}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {resource.current}
                  {!isUnlimited && ` / ${resource.limit}`}
                  {isUnlimited && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      {t('resource_usage.unlimited')}
                    </span>
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <>
                  <Progress value={resource.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {t('resource_usage.percent_used', { percent: resource.percentage })}
                    </span>
                    {isWarning && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        {t('resource_usage.warning_badge')}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={fetchUsage}
        className="mt-6 w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        {t('resource_usage.refresh')}
      </button>
    </Card>
  );
};

export default ResourceUsageCard;
