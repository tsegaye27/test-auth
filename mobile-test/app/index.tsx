import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext"; // Adjust path if needed
import { Redirect, Link } from "expo-router"; // Import Link for a button-like logout

export default function HomeScreen() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // AuthContext's useEffect should handle this redirect,
  // but this is a good safeguard or explicit check.
  if (!isAuthenticated && !isLoading) {
    // Ensure not loading before redirecting
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username || "User"}!</Text>
      <Text style={styles.text}>You are logged in.</Text>
      {user && <Text style={styles.text}>Email: {user.email}</Text>}
      {user && <Text style={styles.text}>ID: {user.id}</Text>}

      {/* Using Link styled as a button for logout */}
      <Link
        href="/(auth)/login"
        asChild
        onPress={async (e) => {
          e.preventDefault(); // Prevent default navigation
          await logout();
          // AuthContext will handle redirect to login
        }}
      >
        <View style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
        </View>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 20,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
    fontSize: 28,
    color: "#FFD700",
    marginBottom: 20,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    color: "#F0F0F0",
    marginBottom: 10,
  },
  button: {
    // Style for the logout button
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#FFD700",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    // Style for the text inside the logout button
    color: "#1e1e1e",
    fontSize: 16,
    fontWeight: "bold",
  },
});
