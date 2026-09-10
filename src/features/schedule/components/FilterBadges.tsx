import { COLORS } from "@/constants/theme";
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {filters.map((filter) => (
          <View key={filter.id} style={styles.badge}>
            <Feather name={filter.icon} size={16} color={COLORS.textPrimary} />
            <Text style={styles.text}>{filter.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    elevation: 4,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "400",
  },
});
