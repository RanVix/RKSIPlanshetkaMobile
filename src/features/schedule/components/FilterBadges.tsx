import { useTheme } from "@/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface FilterItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

interface FilterBadgesProps {
  filters: FilterItem[];
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({ filters }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {filters.map((filter) => (
          <View
            key={filter.id}
            style={[
              styles.badge,
              {
                backgroundColor: colors.badgeBg,
                borderColor: isDark ? colors.badgeBorder : "transparent",
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Feather name={filter.icon} size={16} color={colors.textFilter} />
            <Text style={[styles.text, { color: colors.textFilter }]}>
              {filter.text}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
    overflow: "visible",
  },
  scrollContent: {
    paddingVertical: 6,
  },
  container: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,

    elevation: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
});
