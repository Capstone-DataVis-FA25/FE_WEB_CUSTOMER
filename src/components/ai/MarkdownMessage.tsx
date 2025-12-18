import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{children}</p>
          ),

          // Bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
          ),

          // Code blocks
          code: ({ inline, children, ...props }: any) => {
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-mono border border-blue-200 dark:border-blue-800"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="block px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Lists
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 ml-2">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 ml-2">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>
          ),

          // Blockquotes (Tips/Warnings)
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-r-lg my-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
                <div className="text-blue-800 dark:text-blue-200 text-sm">{children}</div>
              </div>
            </blockquote>
          ),

          // Horizontal rule
          hr: () => <hr className="border-gray-300 dark:border-gray-700 my-6" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
