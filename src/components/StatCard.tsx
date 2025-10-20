import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/untils/utils";
import { Progress } from "@radix-ui/react-progress";
import React from "react";

export default function StatCard({
  title,
  value,
  icon,
  color,
  progress,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
}) {
  return (
    <Card className="border border-green-100 shadow-sm bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
        </div>
        <div className="mt-3">
          <Progress value={progress} className="h-2 bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                progress >= 80
                  ? "bg-emerald-500"
                  : progress >= 65
                  ? "bg-green-500"
                  : progress >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </Progress>
        </div>
      </CardContent>
    </Card>
  );
}
