import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { extractApiError } from "../hook/quiz-hooks";

interface QueryErrorProps {
  error: Error | null;
  onRetry?: () => void;
  onGoBack?: () => void;
  isRetrying?: boolean;
  title?: string;
  className?: string;
}

export function QueryError({
  error,
  onRetry,
  onGoBack,
  isRetrying = false,
  title = "Có lỗi xảy ra",
  className = "min-h-screen flex items-center justify-center p-6",
}: QueryErrorProps) {
  const errorMessage = extractApiError(error);
  return (
    <div className={className}>
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">{title}</CardTitle>
          </div>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              Quay lại
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry} disabled={isRetrying}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Đang thử lại..." : "Thử lại"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
