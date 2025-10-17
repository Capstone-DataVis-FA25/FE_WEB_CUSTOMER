import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
}>({
  open: false,
  setOpen: () => {},
});

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside of the Select container or content
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideContainer = containerRef.current && !containerRef.current.contains(target);
      const isOutsideContent = contentRef.current && !contentRef.current.contains(target);

      if (open && isOutsideContainer && isOutsideContent) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRef, contentRef }}>
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { setOpen, open, triggerRef } = React.useContext(SelectContext);

    React.useImperativeHandle(ref, () => (triggerRef?.current ?? null) as HTMLButtonElement);

    return (
      <button
        ref={triggerRef}
        type="button"
        data-select-trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200',
          open && 'ring-2 ring-blue-500 border-blue-500',
          className
        )}
        onClick={() => setOpen(prev => !prev)}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            'h-4 w-4 opacity-50 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { open, contentRef } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      data-select-content
      className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95"
    >
      <div className="p-1 space-y-1">{children}</div>
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const { onValueChange, setOpen, value: selectedValue } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-150',
        isSelected
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 hover:shadow-sm'
      )}
      data-value={value}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);

  if (!value) {
    return <span className="block truncate text-gray-500">{placeholder}</span>;
  }

  return <span className="block truncate">{value}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
