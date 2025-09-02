import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className, ...props }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      updateValue(e);
    };

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (isDragging) {
          updateValue(e);
        }
      },
      [isDragging]
    );

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(false);
    }, []);

    const updateValue = (e: MouseEvent | React.MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newValue = Math.min(max, Math.max(min, min + percent * (max - min)));
      const steppedValue = Math.round(newValue / step) * step;
      onValueChange([steppedValue]);
    };

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full bg-blue-500 dark:bg-blue-600"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute block h-5 w-5 rounded-full border-2 border-blue-500 dark:border-blue-600 bg-white dark:bg-gray-800 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab"
          style={{ left: `calc(${percentage}% - 10px)` }}
          onMouseDown={handleMouseDown}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
