
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'streaming';

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
  // Always use streaming theme by default
  const [theme, setThemeState] = useState<Theme>('streaming');

  useEffect(() => {
    // Apply theme class to the document body
    document.body.classList.remove('theme-default', 'theme-streaming');
    document.body.classList.add(`theme-${theme}`);
    
    // Make sure the CSS is loaded 
    document.documentElement.style.setProperty('--primary', '267 75% 65%');
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Apply theme class to the document body
    document.body.classList.remove('theme-default', 'theme-streaming');
    document.body.classList.add(`theme-${newTheme}`);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
