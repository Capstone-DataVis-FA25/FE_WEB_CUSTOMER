import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import useToast from '@/hooks/useToast';
import resourceUsageService, { type ResourceUsageResponse } from '@/services/resourceUsage.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Database, BarChart3, Sparkles, AlertTriangle } from 'lucide-react';

interface ResourceUsageCardProps {
  className?: string;
  onWarning?: (warnings: string[]) => void;
}

const ResourceUsageCard: React.FC<ResourceUsageCardProps> = ({ className = '', onWarning }) => {
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
            return 'Datasets usage is above 80%';
          case 'charts':
            return 'Charts usage is above 80%';
          case 'aiRequests':
            return 'AI requests usage is above 80%';
          default:
            return `${w} usage is above 80%`;
        }
      });
      showWarning('Resource Warning', warningMessages.join(', '));
    }
  }, [data]);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const response = await resourceUsageService.getMyResourceUsage();
      setData(response);
    } catch (err: any) {
      console.error(err);
      showError('Error', err?.message || 'Failed to load resource usage');
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
      label: 'Datasets',
      current: data.usage.datasetsCount,
      limit: data.limits.maxDatasets,
      percentage: data.percentage.datasets,
      key: 'datasets',
    },
    {
      icon: BarChart3,
      label: 'Charts',
      current: data.usage.chartsCount,
      limit: data.limits.maxCharts,
      percentage: data.percentage.charts,
      key: 'charts',
    },
    {
      icon: Sparkles,
      label: 'AI Requests',
      current: data.usage.aiRequestsCount,
      limit: data.limits.maxAIRequests,
      percentage: data.percentage.aiRequests,
      key: 'aiRequests',
    },
  ];

  return (
    <Card className={`p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resource Usage</h3>
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
              Resource Warning
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              You're nearing your usage limits. Consider upgrading your plan.
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
                      Unlimited
                    </span>
                  )}
                </div>
              </div>
              {!isUnlimited && (
                <>
                  <Progress value={resource.percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{resource.percentage}% used</span>
                    {isWarning && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Warning
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
        Refresh Usage
      </button>
    </Card>
  );
};

export default ResourceUsageCard;
