import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

async function fetchMargin(): Promise<number> {
  try {
    const response = await apiClient.get('/settings/margin');
    if (response.data && response.data.value) {
      return parseFloat(response.data.value) || 1.5;
    }
  } catch (error) {
    console.error("Failed to fetch margin", error);
  }
  return 1.5;
}

export function useMargin() {
  return useQuery({
    queryKey: ["site-margin"],
    queryFn: fetchMargin,
    staleTime: 60 * 1000,
  });
}

export function applyMargin(rate: string, margin: number): string {
  return (parseFloat(rate) * margin).toFixed(4);
}
