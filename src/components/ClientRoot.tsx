"use client";

import { useEffect, useState } from "react";

interface ClientRootProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientRoot({ children, fallback }: ClientRootProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      fallback || (
        <div className="w-full max-w-2xl mx-auto py-12 px-2">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we initialize the application...
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
} 