// components/ErrorView.tsx
"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { ApiError, normalizeError } from "@/lib/error/error";

type Props = {
  error: unknown;
  onRetry?: () => void;
  className?: string;
  variant?: "inline" | "card" | "full";
  title?: string;
};

export function ErrorView({
  error,
  onRetry,
  className,
  variant = "inline",
  title,
}: Props) {
  const err: ApiError = normalizeError(error);

  const container =
    variant === "full"
      ? "min-h-[40vh] flex items-center justify-center"
      : variant === "card"
      ? "p-4 border rounded-xl bg-card"
      : "";

  return (
    <div className={`${container} ${className ?? ""}`}>
      <Alert className="max-w-xl">
        <AlertTitle className="flex items-center gap-2">
          {title ?? "Đã xảy ra lỗi"}
          {err.status && <Badge variant="secondary">HTTP {err.status}</Badge>}
          {err.code && <Badge variant="outline">{err.code}</Badge>}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm leading-relaxed">{err.message}</p>
          {onRetry && (
            <Button
              size="sm"
              className="mt-3"
              variant="outline"
              onClick={onRetry}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
