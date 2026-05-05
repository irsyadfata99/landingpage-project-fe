import { useState, useCallback } from "react";
import api from "@/services/axios.config";

// ==========================================
// useToast — global toast state untuk admin pages
// ==========================================
export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
};

// ==========================================
// useConfirm — confirm dialog state
// ==========================================
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolver?.(true);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    resolver?.(false);
    setOptions(null);
    setResolver(null);
  }, [resolver]);

  return { options, confirm, handleConfirm, handleCancel };
};

// ==========================================
// usePagination — pagination state
// ==========================================
export interface PaginationState {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const usePagination = (initialLimit = 20) => {
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    page: 1,
    limit: initialLimit,
    total_pages: 1,
  });

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const updateFromResponse = useCallback((data: PaginationState) => {
    setPagination(data);
  }, []);

  return { pagination, setPage, updateFromResponse };
};

// ==========================================
// useAdminData — generic fetch hook untuk admin
// ==========================================
interface UseAdminDataOptions<T> {
  endpoint: string;
  params?: Record<string, string | number | boolean | undefined>;
  transform?: (data: unknown) => T;
}

export const useAdminData = <T>({
  endpoint,
  params,
  transform,
}: UseAdminDataOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: unknown }>(endpoint, {
        params,
      });
      const result = transform
        ? transform(res.data.data)
        : (res.data.data as T);
      setData(result);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal memuat data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, transform]);

  return { data, loading, error, refetch: fetch };
};

// ==========================================
// useAdminAction — generic mutation hook (POST/PUT/PATCH/DELETE)
// ==========================================
export const useAdminAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async <T>(
      method: "post" | "put" | "patch" | "delete",
      endpoint: string,
      data?: unknown,
      isFormData = false,
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const config = isFormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

        let res;
        if (method === "delete") {
          res = await api.delete<{ success: boolean; data: T }>(endpoint);
        } else {
          res = await api[method]<{ success: boolean; data: T }>(
            endpoint,
            data,
            config,
          );
        }
        return res.data.data ?? null;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Terjadi kesalahan";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError };
};
