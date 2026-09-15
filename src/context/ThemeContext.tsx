import { THEMES, ThemeType } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: ThemeType;
  colors: typeof THEMES.dark;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "@app_theme_mode";

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  colors: THEMES.dark,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>("dark");

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "light" || savedTheme === "dark") {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Ошибка при чтении темы из памяти:", error);
      }
    };

    loadSavedTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme: ThemeType = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("Ошибка при сохранении темы в кэш:", error);
    }
  };

  const colors = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
