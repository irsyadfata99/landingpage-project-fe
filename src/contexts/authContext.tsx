// ==========================================
// AuthContext.tsx
// Single source of truth untuk auth admin.
// useAuth.ts di src/hooks/ DIHAPUS — pakai ini.
//
// Cara pakai:
//   import { useAuth } from "@/contexts/AuthContext"
// ==========================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { adminLogin, getAdminMe } from "@/services/api";

// ==========================================
// TYPES
// ==========================================
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

// ==========================================
// CONTEXT
// ==========================================
const AuthContext = createContext<AuthContextType | null>(null);

// ==========================================
// PROVIDER
// ==========================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cek token saat mount — restore session
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
        // Token invalid/expired → hapus
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
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// HOOK — satu-satunya cara akses auth
// ==========================================
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
