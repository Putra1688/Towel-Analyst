"use client";

import { useQuery } from "@tanstack/react-query";

export const useLogbookData = () => {
  return useQuery({
    queryKey: ["logbook_data"],
    queryFn: async () => {
      const response = await fetch("/api/gsheets");
      if (!response.ok) {
        throw new Error("Failed to fetch logbook data");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching as requested
  });
};
