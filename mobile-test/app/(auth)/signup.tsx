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

const SIGNUP_ACTION_MUTATION = gql`
  mutation SignupAction(
    $username: String!
    $email: String!
    $password: String!
  ) {
    signup(
      userData: { username: $username, email: $email, password: $password }
    ) {
      id
      username
      email
    }
  }
`;

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [executeSignup, { loading }] = useMutation(SIGNUP_ACTION_MUTATION);

  const handleSignup = async () => {
    setError("");
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const { data, errors: gqlErrors } = await executeSignup({
        variables: { username, email, password },
      });

      if (gqlErrors) {
        const messages = gqlErrors.map((err) => err.message).join("\n");
        setError(messages);
        Alert.alert("Signup Error", messages);
        return;
      }

      if (data?.signup?.id) {
        Alert.alert("Success", "Account created successfully! Please login.", [
          { text: "OK", onPress: () => router.push("/(auth)/login") },
        ]);
      } else {
        setError("Signup failed. Please try again.");
        Alert.alert("Signup Error", "Signup failed. Please try again.");
      }
    } catch (e: any) {
      console.error("Signup Screen - HandleSignup Error:", e);
      const errorMessage =
        e.graphQLErrors?.[0]?.message ||
        e.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      Alert.alert("Signup Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1e1e1e" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
