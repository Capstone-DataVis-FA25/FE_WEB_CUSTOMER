import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DocSectionProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const DocSection: React.FC<DocSectionProps> = ({
  id,
  title,
  icon: Icon,
  children,
  className = '',
}) => {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="prose prose-blue dark:prose-invert max-w-none">{children}</div>
    </section>
  );
};
