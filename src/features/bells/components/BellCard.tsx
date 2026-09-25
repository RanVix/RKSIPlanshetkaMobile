import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BellScheduleType } from "../types/bells";
import { BellRow } from "./BellRow";

interface BellCardProps {
  schedule: BellScheduleType;
  width: number;
  gap: number;
  isActive: boolean;
}

export const BellCard: React.FC<BellCardProps> = ({
  schedule,
  width,
  gap,
  isActive,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      style={[
        styles.card,
        {
          width,
          marginRight: gap,
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBgBorder,
          borderWidth: 1,
        },
        !isActive && { opacity: isDark ? 0.35 : 0.45 },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {schedule.title}
      </Text>
      <View style={styles.itemList}>
        {schedule.items.map((item) => (
          <BellRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  itemList: {
    gap: 14,
  },
});
