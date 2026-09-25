import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { SearchCategory } from "@/features/search/types/search";

const STORAGE_KEY = "@selected_target_name";
const CATEGORY_STORAGE_KEY = "@selected_target_category";

const isSearchCategory = (value: unknown): value is SearchCategory =>
  value === "groups" || value === "teachers" || value === "audiences";

interface ScheduleContextType {
  targetName: string;
  targetCategory: SearchCategory;
  setTargetName: (name: string, category: SearchCategory) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined,
);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [targetName, setTargetNameState] = useState<string>("Выберете группу");
  const [targetCategory, setTargetCategoryState] =
    useState<SearchCategory>("groups");

  useEffect(() => {
    (async () => {
      try {
        const [savedTarget, savedCategory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(CATEGORY_STORAGE_KEY),
        ]);

        if (savedTarget) {
          setTargetNameState(savedTarget);
        }
        if (isSearchCategory(savedCategory)) {
          setTargetCategoryState(savedCategory);
        }
      } catch (e) {
        console.error("Ошибка при чтении из AsyncStorage:", e);
      }
    })();
  }, []);

  const setTargetName = async (newName: string, category: SearchCategory) => {
    setTargetNameState(newName);
    setTargetCategoryState(category);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEY, newName],
        [CATEGORY_STORAGE_KEY, category],
      ]);
    } catch (e) {
      console.error("Ошибка при сохранении в AsyncStorage:", e);
    }
  };

  return (
    <ScheduleContext.Provider
      value={{ targetName, targetCategory, setTargetName }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error(
      "useScheduleContext must be used within a ScheduleProvider",
    );
  }
  return context;
};
