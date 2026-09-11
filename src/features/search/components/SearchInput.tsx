import { COLORS } from "@/constants/theme";
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
  return (
    <View style={styles.container}>
      <Feather
        name="search"
        size={18}
        color="#8E8E93"
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholder="Поиск"
        placeholderTextColor="#8E8E93"
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
          <Feather name="x" size={16} color="#8E8E93" />
        </TouchableOpacity>
      ) : onClose ? (
        <TouchableOpacity
          onPress={onClose}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Feather name="x" size={18} color="#8E8E93" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B22",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
});
