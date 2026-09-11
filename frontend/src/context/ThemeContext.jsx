import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'dark'); // 'dark' | 'light' | 'midnight'

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark', 'midnight');
      root.classList.add('light');
    } else if (theme === 'midnight') {
      root.classList.remove('light', 'dark');
      root.classList.add('midnight');
    } else {
      root.classList.remove('light', 'midnight');
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('midnight');
    else setTheme('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
