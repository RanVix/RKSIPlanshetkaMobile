import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type TabId = "pairs" | "bells" | "links";

interface TabItem {
  id: TabId;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const TABS: TabItem[] = [
  { id: "pairs", label: "Пары", icon: "calendar" },
  { id: "bells", label: "Звонки", icon: "clock" },
  { id: "links", label: "Ссылки", icon: "link" },
];

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("pairs");
  const [tabLayouts, setTabLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});

  const handleLayout = (id: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => ({ ...prev, [id]: { x, width } }));
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const currentLayout = tabLayouts[activeTab];

    if (!currentLayout) {
      return { opacity: 0 };
    }

    const duration = 200;
    const easing = Easing.out(Easing.quad);

    return {
      opacity: withTiming(1, { duration }),
      width: withTiming(currentLayout.width, { duration, easing }),
      transform: [
        {
          translateX: withTiming(currentLayout.x, { duration, easing }),
        },
      ],
    };
  }, [activeTab, tabLayouts]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.activeIndicator, animatedIndicatorStyle]}
        />

        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onLayout={(e) => handleLayout(tab.id, e)}
              style={styles.tab}
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
    position: "relative",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  activeIndicator: {
    position: "absolute",
    top: 6,
    bottom: 6,
    backgroundColor: "#353D4A",
    borderRadius: 28,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 28,
    minWidth: 80,
    zIndex: 1,
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
