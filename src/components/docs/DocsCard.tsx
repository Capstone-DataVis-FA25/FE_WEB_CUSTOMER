import React from 'react';
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

type CardType = 'info' | 'warning' | 'tip' | 'danger';

interface DocsCardProps {
  type?: CardType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const cardConfig: Record<
  CardType,
  {
    icon: React.ElementType;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
  }
> = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-900 dark:text-yellow-100',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-900 dark:text-green-100',
  },
  danger: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-900 dark:text-red-100',
  },
};

export const DocsCard: React.FC<DocsCardProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const config = cardConfig[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-4 border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          {title && <h4 className={`font-semibold ${config.textColor} mb-2`}>{title}</h4>}
          <div className={`text-sm ${config.textColor}`}>{children}</div>
        </div>
      </div>
    </div>
  );
};
