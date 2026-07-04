"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        {change && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              changeType === "positive" && "text-emerald-700 bg-emerald-50",
              changeType === "negative" && "text-red-700 bg-red-50",
              changeType === "neutral" && "text-gray-600 bg-gray-50"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}
