import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BellItem } from "../types/bells";

interface BellRowProps {
  item: BellItem;
}

export const BellRow: React.FC<BellRowProps> = ({ item }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={styles.row}>
      {/* На светлой теме кружок черный (#000000) с белым текстом (#FFFFFF) */}
      <View
        style={[
          styles.numberBadge,
          {
            backgroundColor: isDark ? colors.LessonCardBackground : "#000000",
          },
        ]}
      >
        <Text
          style={[
            styles.numberText,
            { color: isDark ? colors.badgeTextColor : "#FFFFFF" },
          ]}
        >
          {item.number}
        </Text>
      </View>

      {/* Текст со временем пар: черный на светлой теме, из темы на темной */}
      <Text style={[styles.timeText, { color: colors.textPrimary }]}>
        {item.time}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 20,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
