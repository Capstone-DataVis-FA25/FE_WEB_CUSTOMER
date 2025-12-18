declare module 'driver.js' {
  export interface DriveStep {
    element?: string | Element;
    popover?: {
      title?: string;
      description?: string;
      position?: 'left' | 'right' | 'top' | 'bottom' | 'mid-center' | 'center';
      side?: 'left' | 'right' | 'top' | 'bottom';
      align?: 'start' | 'center' | 'end';
      showButtons?: boolean;
      showCloseButton?: boolean;
      hideNext?: boolean;
      hidePrev?: boolean;
    };
  }

  export interface DriverOptions {
    animate?: boolean;
    allowClose?: boolean;
    overlayOpacity?: number;
    stagePadding?: number;
    showProgress?: boolean;
    steps?: DriveStep[];
    nextBtnText?: string;
    prevBtnText?: string;
    doneBtnText?: string;
    popoverClass?: string;
    showButtons?: string[];
    onHighlightStarted?: (element?: Element) => void;
    onHighlighted?: (element?: Element) => void;
    onDeselected?: (element?: Element) => void;
  }

  export interface Driver {
    highlight: (step: DriveStep) => void;
    drive: (steps?: DriveStep[]) => void;
    setOptions: (options: DriverOptions) => void;
    destroy: () => void;
    refresh: () => void;
    overlay?: HTMLElement;
  }

  export function driver(options?: DriverOptions): Driver;
}
