import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@selected_target_name";

interface ScheduleContextType {
  targetName: string;
  setTargetName: (name: string) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined,
);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [targetName, setTargetNameState] = useState<string>("Выберете группу");

  useEffect(() => {
    (async () => {
      try {
        const savedTarget = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTarget) {
          setTargetNameState(savedTarget);
        }
      } catch (e) {
        console.error("Ошибка при чтении из AsyncStorage:", e);
      }
    })();
  }, []);

  const setTargetName = async (newName: string) => {
    setTargetNameState(newName);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newName);
    } catch (e) {
      console.error("Ошибка при сохранении в AsyncStorage:", e);
    }
  };

  return (
    <ScheduleContext.Provider value={{ targetName, setTargetName }}>
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
