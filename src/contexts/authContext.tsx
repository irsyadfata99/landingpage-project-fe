import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { adminLogin, getAdminMe } from "@/services/api";

interface AdminUser {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await getAdminMe();
        setUser(me);
      } catch {
        localStorage.removeItem("admin_token");
      } finally {
        setLoading(false);
      }
    };
    void check();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setError(null);
      setLoading(true);
      try {
        const result = await adminLogin(email, password);
        localStorage.setItem("admin_token", result.token);
        setUser(result.admin);
        return true;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(
          axiosErr.response?.data?.message ?? "Email atau password salah",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setUser(null);
    window.location.href = "/admin/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
