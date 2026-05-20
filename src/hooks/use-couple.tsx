"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

type MemberUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type CoupleMember = {
  id: string;
  userId: string;
  role: "OWNER" | "PARTNER";
  user: MemberUser;
};

export type CoupleWithMembers = {
  id: string;
  inviteCode: string;
  title: string;
  startedAt: string | null;
  members: CoupleMember[];
};

type CoupleContextValue = {
  couple: CoupleWithMembers | null;
  couples: CoupleWithMembers[];
  isLoading: boolean;
  createCouple: (title: string, startedAt?: string) => Promise<CoupleWithMembers>;
  joinCouple: (inviteCode: string) => Promise<void>;
  refresh: () => Promise<{ couples: CoupleWithMembers[]; couple: CoupleWithMembers | null }>;
};

const CoupleContext = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [couple, setCouple] = useState<CoupleWithMembers | null>(null);
  const [couples, setCouples] = useState<CoupleWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      return { couples: [], couple: null };
    }

    try {
      const result = await apiClient<CoupleWithMembers[]>("/api/couples");
      return { couples: result, couple: result[0] ?? null };
    } catch {
      return { couples: [], couple: null };
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    void refresh().then(({ couples: c, couple: first }) => {
      if (!cancelled) {
        setCouples(c);
        setCouple(first);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [refresh]);

  const createCouple = useCallback(
    async (title: string, startedAt?: string) => {
      const result = await apiClient<CoupleWithMembers>("/api/couples", {
        method: "POST",
        body: { title, startedAt: startedAt || undefined }
      });
      await refresh();
      return result;
    },
    [refresh]
  );

  const joinCouple = useCallback(
    async (inviteCode: string) => {
      await apiClient("/api/couples/join", {
        method: "POST",
        body: { inviteCode }
      });
      await refresh();
    },
    [refresh]
  );

  return (
    <CoupleContext.Provider
      value={{ couple, couples, isLoading, createCouple, joinCouple, refresh }}
    >
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error("useCouple must be used within a CoupleProvider");
  }
  return context;
}
