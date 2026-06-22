import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user && adminOnly && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, isLoading, adminOnly, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.user_metadata?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}