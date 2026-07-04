"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        if (pathname !== "/login") router.push("/login");
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading CRM...</p>
        </div>
      </div>
    );
  }

  if (!user || pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthContext.Provider>
  );
}
