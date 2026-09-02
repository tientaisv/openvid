"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  provider: string;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setLocalUser: (user: User | null, profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(() => {
    try {
      const localUserStr = localStorage.getItem("openvid_local_user");
      const localProfileStr = localStorage.getItem("openvid_local_profile");
      if (localUserStr) {
        const u = JSON.parse(localUserStr);
        const p = localProfileStr ? JSON.parse(localProfileStr) : null;
        setUser(u);
        setProfile(p);
        setSession({ user: u, access_token: "local-token", expires_in: 3600 } as any);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setProfile(data.profile);
          setSession({ user: data.user, access_token: "local-token", expires_in: 3600 } as any);
          try {
            localStorage.setItem("openvid_local_user", JSON.stringify(data.user));
            if (data.profile) localStorage.setItem("openvid_local_profile", JSON.stringify(data.profile));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const setLocalUser = useCallback((newUser: User | null, newProfile: UserProfile | null) => {
    setUser(newUser);
    setProfile(newProfile);
    if (newUser) {
      setSession({ user: newUser, access_token: "local-token", expires_in: 3600 } as any);
      try {
        localStorage.setItem("openvid_local_user", JSON.stringify(newUser));
        if (newProfile) localStorage.setItem("openvid_local_profile", JSON.stringify(newProfile));
      } catch {}
    } else {
      setSession(null);
      try {
        localStorage.removeItem("openvid_local_user");
        localStorage.removeItem("openvid_local_profile");
      } catch {}
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } catch {}
  }, [user]);

  const signOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    try {
      localStorage.removeItem("openvid_local_user");
      localStorage.removeItem("openvid_local_profile");
    } catch {}
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, profile, session, loading, signOut, refreshProfile, setLocalUser }),
    [user, profile, session, loading, signOut, refreshProfile, setLocalUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
