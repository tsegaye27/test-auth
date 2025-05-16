import { Stack } from "expo-router";
import { ApolloProvider } from "@apollo/client";
import client from "../apollo"; // Ensure this path is correct
import { AuthProvider, useAuth } from "../context/AuthContext"; // Ensure this path is correct
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}

function RootLayoutContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: "Home" }} />
      {/* Add your (tabs) or other main app groups here if needed */}
      {/* <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
});
