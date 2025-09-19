"use client";

import { useState, useEffect } from "react";
import { SidebarUserButtonClient } from "./sidebar-user-button-client";

export function SidebarUserButtonWrapper() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Loading state côté serveur
  if (!isClient) {
    return (
      <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg flex items-center gap-2 p-2">
        <div className="size-8 bg-gray-300 rounded-lg" />
        <div className="flex-1 space-y-1">
          <div className="w-24 h-3 bg-gray-300 rounded" />
          <div className="w-32 h-2 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

  return <SidebarUserButtonClient />;
}
