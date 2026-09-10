import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pairs");

  const tabs = [
    { id: "pairs", label: "Пары", icon: "calendar" as const },
    { id: "bells", label: "Звонки", icon: "clock" as const },
    { id: "links", label: "Ссылки", icon: "link" as const },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Feather
                name={tab.icon}
                size={18}
                color={isActive ? "#FFFFFF" : COLORS.textMuted}
                style={styles.icon}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#161B22",
    borderRadius: 40,
    padding: 6,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 28,
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: "#353D4A",
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    color: "#8B949E",
    fontSize: 12,
    fontWeight: "400",
  },
  activeLabel: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
});
