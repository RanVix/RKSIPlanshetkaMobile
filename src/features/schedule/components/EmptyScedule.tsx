import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";

export const EmptySchedule: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.cardBg, borderColor: colors.cardBgBorder },
        ]}
      >
        <Feather
          name="coffee"
          size={28}
          color={colors.accentBlue || "#3B82F6"}
        />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Занятий нет
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Выберите расписание в поиске
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
