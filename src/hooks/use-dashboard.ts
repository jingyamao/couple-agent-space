"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

type DashboardMember = {
  id: string;
  userId: string;
  role: "OWNER" | "PARTNER";
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

type DashboardAnniversary = {
  id: string;
  title: string;
  happenedAt: string;
  remindDays: number[];
  note: string | null;
};

type DashboardMood = {
  id: string;
  userId: string;
  mood: string;
  energy: "LOW" | "MEDIUM" | "HIGH";
  stressLevel: number;
  carePreference: string | null;
  note: string | null;
  checkedAt: string;
  user: { id: string; name: string };
};

type DashboardDiary = {
  id: string;
  title: string;
  content: string;
  visibility: "PRIVATE" | "PARTNER" | "SHARED";
  happenedAt: string;
  author: { id: string; name: string };
};

type DashboardWish = {
  id: string;
  title: string;
  category: string;
  status: "IDEA" | "PLANNED" | "DONE" | "PAUSED";
  targetAt: string | null;
  budgetCents: number | null;
  note: string | null;
  creator: { id: string; name: string };
  completionPercent: number;
};

type DashboardPhoto = {
  id: string;
  url: string;
  title: string | null;
  event: string | null;
  takenAt: string | null;
};

type DashboardTimeCapsule = {
  id: string;
  title: string;
  content: string | null;
  unlockAt: string;
  status: "LOCKED" | "OPENED";
};

export type DashboardData = {
  couple: {
    id: string;
    title: string;
    startedAt: string | null;
    inviteCode: string;
  };
  daysTogether: number;
  members: DashboardMember[];
  anniversaries: DashboardAnniversary[];
  moodCheckIns: DashboardMood[];
  diaryEntries: DashboardDiary[];
  wishes: { items: DashboardWish[]; completionPercent: number };
  photos: DashboardPhoto[];
  timeCapsules: DashboardTimeCapsule[];
};

export function useDashboard(coupleId: string | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!coupleId) {
      return { data: null, error: null };
    }

    try {
      const result = await apiClient<DashboardData>(
        `/api/couples/${coupleId}/dashboard`
      );
      return { data: result, error: null };
    } catch {
      return { data: null, error: "加载数据失败" };
    }
  }, [coupleId]);

  useEffect(() => {
    let cancelled = false;
    void refresh().then(({ data: d, error: err }) => {
      if (!cancelled) {
        setData(d);
        setError(err);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refresh]);

  return { data, isLoading, error, refresh };
}
