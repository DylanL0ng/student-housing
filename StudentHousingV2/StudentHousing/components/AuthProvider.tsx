import React, { createContext, useState, useEffect, useContext } from "react";
// import { getUserData, login, logout } from "../utils/auth"; // Replace with actual auth logic

interface AuthContextType {
  user: any | null;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      //   try {
      //     const userData = await getUserData(); // Fetch user from storage/API
      //     setUser(userData);
      //   } catch (error) {
      //     console.error("Error fetching user:", error);
      //   } finally {
      //     setLoading(false);
      //   }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
