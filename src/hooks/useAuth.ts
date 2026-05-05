import { useState, useEffect, useCallback } from "react";
import { adminLogin, getAdminMe } from "@/services/api";

interface AdminUser {
  id: string;
  username: string;
  email: string;
}

interface UseAuthReturn {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cek token saat mount
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

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
