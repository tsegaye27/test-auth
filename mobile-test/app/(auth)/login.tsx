import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../../context/AuthContext"; // Adjust path if needed

const LOGIN_ACTION_MUTATION = gql`
  mutation LoginAction($emailOrUsername: String!, $password: String!) {
    login(
      credentials: { emailOrUsername: $emailOrUsername, password: $password }
    ) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export default function LoginScreen() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [executeLogin, { loading }] = useMutation(LOGIN_ACTION_MUTATION);

  const handleLogin = async () => {
    setError("");
    if (!emailOrUsername || !password) {
      setError("Please enter both username/email and password.");
      return;
    }

    try {
      const { data, errors: gqlErrors } = await executeLogin({
        variables: { emailOrUsername, password },
      });

      if (gqlErrors) {
        const messages = gqlErrors.map((err) => err.message).join("\n");
        setError(messages);
        Alert.alert("Login Error", messages);
        return;
      }

      if (data?.login?.token && data?.login?.user) {
        await contextLogin(data.login.token, data.login.user);
        // Alert.alert("Success", "Login successful!"); // Optional: AuthContext handles redirect
      } else {
        setError("Login failed. Invalid response from server.");
        Alert.alert("Login Error", "Invalid response from server.");
      }
    } catch (e: any) {
      console.error("Login Screen - HandleLogin Error:", e);
      const errorMessage =
        e.graphQLErrors?.[0]?.message ||
        e.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      Alert.alert("Login Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email/Username"
        placeholderTextColor="#888"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1e1e1e" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>
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
  title: { fontSize: 32, color: "#FFD700", marginBottom: 40 },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    color: "#F0F0F0",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#FFD700",
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  buttonText: { color: "#1e1e1e", fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#F0F0F0", marginTop: 10 },
  errorText: { color: "#FF6347", marginBottom: 10, textAlign: "center" },
});
