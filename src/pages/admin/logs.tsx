import { useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function LogsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return null;
}

export default function LogsPage() {
  return (
    <ProtectedRoute adminOnly>
      <LogsRedirect />
    </ProtectedRoute>
  );
}