import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadAuthStatus = async () => {
      console.log("[AuthContext] loadAuthStatus: Checking token...");
      setIsLoading(true);
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        console.log(
          "[AuthContext] loadAuthStatus: Token from storage:",
          storedToken,
        );
        if (storedToken) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Failed to load auth status:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const currentRoute =
      segments.join("/") ||
      (segments.length === 1 && segments[0] === "" ? "index" : "");

    console.log(
      "[AuthContext] Redirect Effect: isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "inAuthGroup:",
      inAuthGroup,
      "segments:",
      segments,
      "currentRoute:",
      currentRoute,
    );

    if (isAuthenticated) {
      if (inAuthGroup) {
        console.log(
          "[AuthContext] Authenticated user in auth group, redirecting to / from:",
          currentRoute,
        );
        router.replace("/");
      }
    } else {
      if (
        !inAuthGroup &&
        currentRoute !== "index" &&
        !currentRoute.startsWith("+not-found")
      ) {
        console.log(
          "[AuthContext] Unauthenticated user, redirecting to /(auth)/login from:",
          currentRoute,
        );
        router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, isLoading, segments, router]);

  const login = async (token: string, userData: User) => {
    console.log(
      "[AuthContext] login: Attempting to log in with token:",
      token ? "TOKEN_PRESENT" : "NO_TOKEN",
      "User:",
      userData,
    );
    try {
      await AsyncStorage.setItem("userToken", token);
      setUser(userData);
      setIsAuthenticated(true);
      console.log("[AuthContext] login: Success. isAuthenticated set to true.");
    } catch (error) {
      console.error("AuthContext: Failed to save token/user info:", error);
    }
  };

  const logout = async () => {
    console.log("[AuthContext] logout: Attempting to log out.");
    try {
      await AsyncStorage.removeItem("userToken");
      setUser(null);
      setIsAuthenticated(false);
      console.log(
        "[AuthContext] logout: Success. isAuthenticated set to false.",
      );
    } catch (error) {
      console.error("AuthContext: Failed to remove token/user info:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
