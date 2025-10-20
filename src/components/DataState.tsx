// components/DataState.tsx
"use client";
import { ReactNode } from "react";
import { ErrorView } from "./ErrorView";

type Props = {
  isLoading: boolean;
  error: unknown;
  skeleton?: ReactNode;
  onRetry?: () => void;
  variant?: "inline" | "card" | "full";
  children: ReactNode;
};

export function DataState({
  isLoading,
  error,
  skeleton,
  onRetry,
  variant = "inline",
  children,
}: Props) {
  if (isLoading) return <>{skeleton ?? null}</>;
  if (error)
    return <ErrorView error={error} onRetry={onRetry} variant={variant} />;
  return <>{children}</>;
}
