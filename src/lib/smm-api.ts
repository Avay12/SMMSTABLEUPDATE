import { useQuery } from "@tanstack/react-query";


export interface SmmService {
  service: number | string;
  name: string;
  category: string;
  rate: string;
  min: number;
  max: number;
  type: string;
  cancel: boolean;
  refill: boolean;
  dripfeed: boolean;
  recommended: boolean;
  average_time?: string | number;
}

import { apiClient } from "./apiClient";

async function fetchServices(): Promise<SmmService[]> {
  // Fetch services and margin setting in parallel
  // Use the public endpoint so non-admin users can read the margin
  const [servicesRes, marginRes] = await Promise.all([
    apiClient.get('/services'),
    apiClient.get('/public/settings/service_margin').catch(() => ({ data: { value: 0 } })),
  ]);

  const data = servicesRes.data?.data || servicesRes.data;
  const marginValue = Number(marginRes.data?.value || 1); // e.g. 1.5 = 1.5x markup
  const marginMultiplier = marginValue > 0 ? marginValue : 1;

  // Map DB format to SmmService interface, applying margin to rate
  return (data || []).map((s: any) => {
    const baseRate = parseFloat(s.rate || s.price || 0) || 0;
    const adjustedRate = baseRate * marginMultiplier;
    return {
      service: s.service || s.serviceId || s.id,
      name: s.name,
      category: s.category,
      rate: adjustedRate.toFixed(4), // apply margin to displayed rate
      min: s.min_quantity || s.min || 0,
      max: s.max_quantity || s.max,
      type: s.type || "Default",
      cancel: s.cancel || false,
      refill: s.refill || false,
      dripfeed: s.dripfeed || false,
      recommended: s.recommended || false,
      average_time: s.average_time,
    };
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["smm-services"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
  });
}

/** Extract unique categories and count services per category */
export function groupByCategory(services: SmmService[]) {
  const map = new Map<string, SmmService[]>();
  for (const s of services) {
    const cat = s.category;
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(s);
  }
  return map;
}

/** Derive a platform name from a category string */
export function getPlatform(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("instagram")) return "Instagram";
  if (lower.includes("tiktok")) return "TikTok";
  if (lower.includes("youtube")) return "YouTube";
  if (lower.includes("facebook")) return "Facebook";
  if (lower.includes("twitter") || lower.includes("x ")) return "X (Twitter)";
  if (lower.includes("telegram")) return "Telegram";
  if (lower.includes("spotify")) return "Spotify";
  if (lower.includes("twitch")) return "Twitch";
  if (lower.includes("kick")) return "Kick";
  if (lower.includes("linkedin")) return "LinkedIn";
  if (lower.includes("discord")) return "Discord";
  if (lower.includes("threads")) return "Threads";
  if (lower.includes("snapchat")) return "Snapchat";
  if (lower.includes("website") || lower.includes("traffic")) return "Website Traffic";
  return "Other";
}

export function getPlatforms(services: SmmService[]) {
  const counts = new Map<string, number>();
  for (const s of services) {
    const p = getPlatform(s.category);
    counts.set(p, (counts.get(p) || 0) + 1);
  }
  const all: { name: string; count: number }[] = [
    { name: "All Platforms", count: services.length },
  ];
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sorted) {
    all.push({ name, count });
  }
  return all;
}
