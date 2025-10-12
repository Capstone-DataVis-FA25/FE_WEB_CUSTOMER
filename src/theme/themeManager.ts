import { createContext, useContext } from 'react';

// Định nghĩa các loại theme có thể sử dụng
export type Theme = 'light' | 'dark' | 'system';

// Interface cho context props của theme
interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Tạo context để chia sẻ theme state giữa các component
export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Hook để sử dụng theme context trong component
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hàm tiện ích để lấy theme hệ thống (dark/light mode của browser)
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// Áp dụng theme vào DOM bằng cách thêm/xóa class 'dark'
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  // If theme is 'system', use OS/browser preference
  if (theme === 'system') {
    const system = getSystemTheme();
    root.classList.toggle('dark', system === 'dark');
    return;
  }

  root.classList.toggle('dark', theme === 'dark');
};

// Lấy theme đã lưu từ localStorage
export const getStoredTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light'; // mặc định là light
  }
  return 'light';
};

// Lưu theme vào localStorage
export const setStoredTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
};
