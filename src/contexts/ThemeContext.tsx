
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'netflix' | 'prime';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return (savedTheme as Theme) || 'default';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
    
    // Apply theme class to the document body
    document.body.classList.remove('theme-default', 'theme-netflix', 'theme-prime');
    document.body.classList.add(`theme-${newTheme}`);
  };

  // Initialize theme on mount
  useEffect(() => {
    document.body.classList.add(`theme-${theme}`);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
