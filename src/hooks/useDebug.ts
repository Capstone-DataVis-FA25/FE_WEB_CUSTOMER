// File này là 1 custom hook để quản lý debug mode của ứng dụng

import { useState, useEffect } from 'react';

interface DebugSettings {
  isEnabled: boolean;
  showInProduction: boolean;
  autoCollapse: boolean;
}

const STORAGE_KEY = 'debug-settings';

const defaultSettings: DebugSettings = {
  isEnabled: !import.meta.env.PROD, // Mặc định bật trong development
  showInProduction: false,
  autoCollapse: true,
};

export const useDebug = () => {
  const [settings, setSettings] = useState<DebugSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load debug settings:', error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save debug settings:', error);
    }
  }, [settings]);

  const toggleDebug = () => {
    setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  const updateSettings = (updates: Partial<DebugSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const shouldShow = settings.isEnabled && (import.meta.env.DEV || settings.showInProduction);

  return {
    settings,
    shouldShow,
    toggleDebug,
    updateSettings,
  };
};

// Global shortcut để toggle debug (Ctrl/Cmd + Shift + D)
export const useDebugShortcut = (callback: () => void) => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [callback]);
};
