import { createContext, useState, useEffect, useContext, type ReactNode } from "react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface User {
  _id: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  githubId: string;
  email: string;
  accessToken?: string;
  plan?: {
    name: string;
    maxApps: number;
    maxSessions: number;
    features: string[];
  };
  stats?: {
    totalApps: number;
    activeSessions: number;
    totalSessions: number;
  };
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/auth/status`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    fetch(`${SERVER_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        setUser(null);
        window.location.href = "/";
      })
      .catch(() => {
        setUser(null);
        window.location.href = "/";
      });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
