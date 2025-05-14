'use client';

import React from "react";
import { BoltIcon } from "lucide-react";

export function Heading({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string,
  description: string,
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border rounded-lg bg-muted/10">
      <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-4">
        <BoltIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      <div className="flex gap-3">
        {action}
      </div>
    </div>
  );
} 