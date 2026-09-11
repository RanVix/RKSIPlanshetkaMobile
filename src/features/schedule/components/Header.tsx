import { COLORS } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  groupName: string;
}

export const Header: React.FC<HeaderProps> = ({ groupName }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupName}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="search" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
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
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 4,
    height: 40,
  },
  iconButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
});
