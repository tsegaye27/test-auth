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

// Placeholder: You'd need a 'forgotPassword' action in Hasura and your auth server
const FORGOT_PASSWORD_ACTION_MUTATION = gql`
  mutation ForgotPasswordAction($email: String!) {
    # This is a conceptual action name.
    # Your actual action might return a success boolean or a message.
    requestPasswordReset(email: $email) {
      success # Example field
      message # Example field
    }
  }
`;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success messages

  const [executeForgotPassword, { loading }] = useMutation(
    FORGOT_PASSWORD_ACTION_MUTATION,
  );

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      // For this test, we'll simulate the call as the backend action isn't fully defined
      console.log("Simulating forgot password request for:", email);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      setMessage(
        "If an account with that email exists, a password reset link has been sent.",
      );
      Alert.alert(
        "Password Reset",
        "If an account with that email exists, a password reset link has been sent.",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }],
      );

      // --- Real implementation would look like this: ---
      // const { data, errors: gqlErrors } = await executeForgotPassword({
      //   variables: { email },
      // });
      // if (gqlErrors) {
      //   const messages = gqlErrors.map(err => err.message).join("\n");
      //   setError(messages);
      //   Alert.alert("Error", messages);
      //   return;
      // }
      // if (data?.requestPasswordReset?.success) {
      //   setMessage(data.requestPasswordReset.message || "Password reset instructions sent.");
      //   Alert.alert("Success", data.requestPasswordReset.message || "Password reset instructions sent.");
      //   // router.push("/(auth)/login"); // Or to a confirmation page
      // } else {
      //   setError(data?.requestPasswordReset?.message || "Failed to send reset instructions.");
      //   Alert.alert("Error", data?.requestPasswordReset?.message || "Failed to send reset instructions.");
      // }
    } catch (e: any) {
      console.error("Forgot Password Screen - Error:", e);
      const errorMessage =
        e.graphQLErrors?.[0]?.message ||
        e.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? <Text style={styles.successText}>{message}</Text> : null}
      <Text style={styles.instructions}>
        Enter your email address and we'll send you instructions to reset your
        password.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#1e1e1e" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text style={styles.linkText}>Back to Login</Text>
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
  title: { fontSize: 32, color: "#FFD700", marginBottom: 20 },
  instructions: {
    color: "#F0F0F0",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
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
  successText: { color: "#32CD32", marginBottom: 10, textAlign: "center" }, // LimeGreen for success
});
