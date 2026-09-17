import React, { createContext, useContext, useState } from "react";

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
  // Дефолтное значение для стартовой загрузки
  const [targetName, setTargetName] = useState<string>("ИС-31");

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
