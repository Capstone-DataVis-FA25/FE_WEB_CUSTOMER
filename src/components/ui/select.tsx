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

// Keep track of all Select instances so we can close others when one opens
const allSelectSetters = new Set<React.Dispatch<React.SetStateAction<boolean>>>();

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
  closeOthers?: () => void;
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

  // Register this Select's setter so we can close it from other instances
  React.useEffect(() => {
    allSelectSetters.add(setOpen);
    return () => {
      allSelectSetters.delete(setOpen);
    };
  }, [setOpen]);

  const closeOthers = React.useCallback(() => {
    allSelectSetters.forEach(fn => {
      if (fn !== setOpen) {
        fn(false);
      }
    });
  }, []);

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
        closeOthers,
      }}
    >
      <div className="relative" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen, open, triggerRef, closeOthers } = React.useContext(SelectContext);

    React.useImperativeHandle(ref, () => (triggerRef?.current ?? null) as HTMLButtonElement);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (!open) {
        // When opening this Select, close all others
        closeOthers?.();
        setOpen(true);
      } else {
        setOpen(false);
      }

      onClick?.(e);

      // Notify the rest of the app that a Select has just been toggled open/closed.
      // This lets custom dropdowns (like the feature multi-select) respond and close themselves.
      try {
        window.dispatchEvent(
          new CustomEvent('app:select-toggled', {
            detail: { open: !open },
          })
        );
      } catch {
        // In non-browser environments, window may not exist; safely ignore.
      }
    };

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
        onClick={handleClick}
        onMouseDown={e => e.stopPropagation()}
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
        'fixed z-[10000] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95',
        className
      )}
      style={{ left: pos.left, top: pos.top, width: pos.width }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
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
    registerItemRef?.(value, itemRef as React.RefObject<HTMLDivElement>);
    return () => {
      unregisterItem?.(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, children]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      onMouseDown={e => e.stopPropagation()}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onValueChange?.(value);
          setOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder, options }) => {
  const { value, itemsMap } = React.useContext(SelectContext);
  const [label, setLabel] = React.useState<string>('');
  const labelCacheRef = React.useRef<Map<string, string>>(new Map());

  // Function to get label from itemsMap, cache, or options
  const getLabel = React.useCallback(() => {
    if (!value) return '';

    // First try itemsMap (most up-to-date)
    const mapLabel = itemsMap?.current.get(value);
    if (mapLabel) {
      // Cache it for when itemsMap is cleared
      labelCacheRef.current.set(value, mapLabel);
      return mapLabel;
    }

    // Try cache (for when dropdown is closed and itemsMap is cleared)
    const cachedLabel = labelCacheRef.current.get(value);
    if (cachedLabel) return cachedLabel;

    // Fallback to options prop
    const optionLabel = options?.find(opt => opt.value === value)?.label;
    if (optionLabel) {
      labelCacheRef.current.set(value, optionLabel);
      return optionLabel;
    }

    // Last resort: use value itself
    return value;
  }, [value, itemsMap, options]);

  React.useEffect(() => {
    const newLabel = getLabel();
    if (newLabel !== label) {
      setLabel(newLabel);
    }
  }, [getLabel, label]);

  // Poll itemsMap when value exists but label is still the value (meaning itemsMap wasn't ready)
  React.useEffect(() => {
    if (!value) return;

    // If we have a cached label that's not the value, use it
    const cachedLabel = labelCacheRef.current.get(value);
    if (cachedLabel && cachedLabel !== value && label === value) {
      setLabel(cachedLabel);
      return;
    }

    // If label is still the raw value, try to get it from itemsMap
    if (label === value) {
      const mapLabel = itemsMap?.current.get(value);
      if (mapLabel && mapLabel !== value) {
        setLabel(mapLabel);
        labelCacheRef.current.set(value, mapLabel);
        return;
      }

      // Poll itemsMap periodically until we get a proper label
      const interval = setInterval(() => {
        const mapLabel = itemsMap?.current.get(value);
        if (mapLabel && mapLabel !== value) {
          setLabel(mapLabel);
          labelCacheRef.current.set(value, mapLabel);
          clearInterval(interval);
        }
      }, 50);

      // Clear after 1 second to avoid infinite polling
      const timeout = setTimeout(() => clearInterval(interval), 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [value, label, itemsMap]);

  if (!value) return <span className="block truncate text-gray-500">{placeholder}</span>;

  // Check if label contains "(number)" badge pattern and render with flex layout
  const badgeMatch = label.match(/^(.+?)\s*\(number\)$/);
  if (badgeMatch) {
    const columnName = badgeMatch[1].trim();
    return (
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{columnName}</span>
        <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
          (number)
        </span>
      </div>
    );
  }

  return <span className="block truncate">{label || placeholder}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
