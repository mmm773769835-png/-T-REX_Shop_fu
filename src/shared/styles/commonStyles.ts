import { StyleSheet, ViewStyle, TextStyle } from "react-native";

/**
 * Common header style used across most screens.
 */
export const headerStyles = (isDarkMode: boolean): Record<string, ViewStyle | TextStyle> => ({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 1,
  },
});

/**
 * Common empty-state container styles.
 */
export const emptyStateStyles = (isDarkMode: boolean): Record<string, ViewStyle | TextStyle> => ({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIconWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: isDarkMode ? "#fff" : "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginBottom: 28,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  browseButtonText: {
    color: "#1a1a1a",
    fontWeight: "800",
    fontSize: 15,
  },
});

/**
 * Common card style (used in product items, list items, etc.)
 */
export const cardStyles = (isDarkMode: boolean): Record<string, ViewStyle | TextStyle> => ({
  card: {
    backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
});
