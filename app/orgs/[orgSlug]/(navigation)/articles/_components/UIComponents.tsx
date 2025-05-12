'use client';

import React from "react";

export function Heading({ title, description }: { title: string, description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-500">{description}</p>
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
    <div className="text-center p-8 border rounded-lg">
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );
} 