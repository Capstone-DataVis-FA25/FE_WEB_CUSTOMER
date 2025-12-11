interface LoadingSpinnerProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({
  title = 'Process loading...',
  subtitle = 'Please wait while we analyze your file',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800'
    : 'flex items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="text-center inline-block">
        <div className="relative">
          {/* Outer rotating ring with mathematical symbols */}
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 dark:border-t-blue-400 dark:border-r-purple-400 animate-spin mx-auto">
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-b-green-500 border-l-orange-500 dark:border-b-emerald-400 dark:border-l-orange-400 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '2s' }}
            ></div>
          </div>

          {/* Inner mathematical symbols */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-pulse">
              ∫
            </div>
          </div>

          {/* Floating mathematical symbols */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 text-blue-500 dark:text-blue-400 animate-bounce"
            style={{ animationDelay: '0s' }}
          >
            π
          </div>
          <div
            className="absolute -top-2 -right-2 w-4 h-4 text-purple-500 dark:text-purple-400 animate-bounce"
            style={{ animationDelay: '0.5s' }}
          >
            Σ
          </div>
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 text-green-500 dark:text-emerald-400 animate-bounce"
            style={{ animationDelay: '1s' }}
          >
            θ
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 text-orange-500 dark:text-orange-400 animate-bounce"
            style={{ animationDelay: '1.5s' }}
          >
            λ
          </div>
        </div>

        <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
