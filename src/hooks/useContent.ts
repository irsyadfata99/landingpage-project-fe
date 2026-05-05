import { useState, useEffect } from "react";
import { getLandingPage } from "@/services/api";
import type { LandingPageData } from "@/types/content.types";

interface UseContentReturn {
  data: LandingPageData | null;
  loading: boolean;
  error: string | null;
}

export const useContent = (): UseContentReturn => {
  const [data, setData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await getLandingPage();
        setData(result);
      } catch {
        setError("Gagal memuat konten halaman");
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, []);

  return { data, loading, error };
};
