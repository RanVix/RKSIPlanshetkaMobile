import { useTheme } from "@/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface HeaderProps {
  groupName: string;
  onSearchPress?: () => void;
  onThemePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  groupName,
  onSearchPress,
  onThemePress,
}) => {
  const router = useRouter();
  const { theme, colors, toggleTheme } = useTheme();

  const themeRotation = useSharedValue(0);
  const themeScale = useSharedValue(1);

  const searchScale = useSharedValue(1);

  const handleSearchPress = () => {
    searchScale.value = withSequence(
      withTiming(1.25, { duration: 120 }),
      withTiming(1, { duration: 120 }),
    );

    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push("/search");
    }
  };

  const handleThemePress = () => {
    themeRotation.value = 0;
    themeRotation.value = withTiming(360, { duration: 300 });

    themeScale.value = withSequence(
      withTiming(0.6, { duration: 150 }),
      withTiming(1, { duration: 150 }),
    );

    if (onThemePress) {
      onThemePress();
    } else {
      toggleTheme();
    }
  };

  const animatedThemeIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${themeRotation.value}deg` },
      { scale: themeScale.value },
    ],
  }));

  const animatedSearchIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {groupName}
      </Text>

      <View
        style={[
          styles.actions,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={handleSearchPress}
        >
          <Animated.View style={animatedSearchIconStyle}>
            <Feather name="search" size={18} color={colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={handleThemePress}
        >
          <Animated.View style={animatedThemeIconStyle}>
            <Feather
              name={theme === "dark" ? "sun" : "moon"}
              size={18}
              color={colors.textPrimary}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  iconButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
});
