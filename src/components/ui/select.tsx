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
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  itemsMap?: React.MutableRefObject<Map<string, string>>;
  registerItem?: (value: string, label: string) => void;
  unregisterItem?: (value: string) => void;
  itemsRef?: React.MutableRefObject<Map<string, React.RefObject<HTMLDivElement>>>;
  registerItemRef?: (value: string, ref: React.RefObject<HTMLDivElement>) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const itemsMap = React.useRef(new Map<string, string>());
  const itemsRef = React.useRef(new Map<string, React.RefObject<HTMLDivElement>>());

  const registerItem = React.useCallback((v: string, label: string) => {
    itemsMap.current.set(v, label);
  }, []);
  const unregisterItem = React.useCallback((v: string) => {
    itemsMap.current.delete(v);
    itemsRef.current.delete(v);
  }, []);
  const registerItemRef = React.useCallback((v: string, ref: React.RefObject<HTMLDivElement>) => {
    itemsRef.current.set(v, ref);
  }, []);

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
    <SelectContext.Provider
      value={{
        value,
        onValueChange,
        open,
        setOpen,
        triggerRef,
        contentRef,
        itemsMap,
        registerItem,
        unregisterItem,
        itemsRef,
        registerItemRef,
      }}
    >
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

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { open, contentRef, triggerRef, setOpen, itemsMap, itemsRef } =
    React.useContext(SelectContext);
  const lastKeyRef = React.useRef<string>('');
  const keyPressTimeRef = React.useRef<number>(0);
  const matchIndexRef = React.useRef<number>(0);

  const [pos, setPos] = React.useState<{ left: number; top: number; width: number } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const update = () => {
      const trg = triggerRef?.current;
      if (!trg) return;
      const rect = trg.getBoundingClientRect();
      setPos({ left: rect.left, top: rect.bottom + 4, width: rect.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, triggerRef]);

  React.useEffect(() => {
    if (!open) {
      lastKeyRef.current = '';
      matchIndexRef.current = 0;
      keyPressTimeRef.current = 0;
      return;
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      // Handle letter key presses for navigation
      if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        e.preventDefault();
        const key = e.key.toLowerCase();
        const now = Date.now();

        // Reset match index if different key or more than 500ms passed
        if (lastKeyRef.current !== key || now - keyPressTimeRef.current > 500) {
          matchIndexRef.current = 0;
        } else {
          matchIndexRef.current += 1;
        }

        lastKeyRef.current = key;
        keyPressTimeRef.current = now;

        // Find all items that start with this key (case-insensitive)
        const matches: string[] = [];
        itemsMap?.current.forEach((label, value) => {
          const labelLower = label.toLowerCase();
          if (labelLower.startsWith(key)) {
            matches.push(value);
          }
        });

        if (matches.length > 0) {
          // Cycle through matches
          const index = matchIndexRef.current % matches.length;
          const matchedValue = matches[index];
          const itemRef = itemsRef?.current.get(matchedValue);

          if (itemRef?.current && contentRef?.current) {
            // Scroll item into view
            itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            // Highlight the item temporarily
            itemRef.current.focus();
          }
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [open, setOpen, itemsMap, itemsRef, contentRef]);

  if (!open || !pos) return null;

  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      data-select-content
      className={cn(
        'fixed z-[1000] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95',
        className
      )}
      style={{ left: pos.left, top: pos.top, width: pos.width }}
    >
      <div className="p-1 space-y-1">{children}</div>
    </div>,
    document.body
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const {
    onValueChange,
    setOpen,
    value: selectedValue,
    registerItem,
    unregisterItem,
    registerItemRef,
  } = React.useContext(SelectContext);
  const itemRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const label =
      typeof children === 'string' ? children : itemRef.current?.textContent || String(value);
    registerItem?.(value, label);
    registerItemRef?.(value, itemRef);
    return () => {
      unregisterItem?.(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, children]);

  const handleClick = () => {
    onValueChange?.(value);
    setOpen(false);
  };

  const isSelected = selectedValue === value;

  return (
    <div
      ref={itemRef}
      tabIndex={-1}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-md py-2.5 px-3 text-sm outline-none transition-all duration-150',
        isSelected
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 hover:shadow-sm'
      )}
      data-value={value}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, options }) => {
  const { value, itemsMap } = React.useContext(SelectContext);

  if (!value) return <span className="block truncate text-gray-500">{placeholder}</span>;

  const label =
    itemsMap?.current.get(value) || options?.find(opt => opt.value === value)?.label || value;
  return <span className="block truncate">{label}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
