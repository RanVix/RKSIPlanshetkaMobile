import { COLORS } from "@/constants/theme";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DaySchedule } from "../types/schedule";

interface DaySelectorProps {
  days: DaySchedule[];
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days }) => {
  const [selectedId, setSelectedId] = useState(days[0]?.id);

  return (
    <View style={styles.container}>
      {days.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.dayCard, isSelected && styles.activeCard]}
            onPress={() => setSelectedId(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayOfWeek, isSelected && styles.activeText]}>
              {item.dayOfWeek}
            </Text>
            <Text style={[styles.date, isSelected && styles.activeText]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 8,
  },
  dayCard: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  activeCard: {
    backgroundColor: COLORS.primary,
  },
  dayOfWeek: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  date: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeText: {
    color: COLORS.textPrimary,
  },
});
