import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarSection {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
  }[];
}

interface DocsSidebarProps {
  sections: SidebarSection[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  sections,
  activeSection,
  onSectionClick,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = React.useState<string[]>(sections.map(s => s.id));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${className}`}
    >
      <nav className="p-4 space-y-2">
        {sections.map(section => (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>{section.title}</span>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedSections.includes(section.id) && (
              <div className="ml-4 space-y-1 overflow-hidden animate-slideDown">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSectionClick(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
