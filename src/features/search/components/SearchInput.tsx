import { useTheme } from "@/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  onClear,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.cardBgBorder,
          borderWidth: 1,
        },
      ]}
    >
      <Feather
        name="search"
        size={18}
        color={colors.textMuted}
        style={styles.searchIcon}
      />

      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder="Поиск"
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
      />

      {value.length > 0 ? (
        <TouchableOpacity
          onPress={onClear}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="x" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ) : onClose ? (
        <TouchableOpacity
          onPress={onClose}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 20,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
});
