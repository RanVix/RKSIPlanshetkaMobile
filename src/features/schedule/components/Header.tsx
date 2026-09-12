import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push("/search");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupName}</Text>

      {/* Единая плашка-капсула */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={handleSearchPress}
        >
          <Feather name="search" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onThemePress}
        >
          <Feather name="sun" size={18} color={COLORS.textPrimary} />
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
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
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
