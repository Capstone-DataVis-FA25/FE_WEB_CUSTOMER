import React, { useEffect, useState } from 'react';
import type { Theme } from './themeManager';
import { ThemeContext, applyTheme, getStoredTheme, setStoredTheme } from './themeManager';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
}) => {
  // Khởi tạo theme từ localStorage nếu có, nếu không thì dùng defaultTheme
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() || defaultTheme);

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
