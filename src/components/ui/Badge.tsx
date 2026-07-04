"use client";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "gray";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-blue-100 text-blue-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-cyan-100 text-cyan-800",
  purple: "bg-purple-100 text-purple-800",
  gray: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function getLeadStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    new: "info",
    contacted: "warning",
    qualified: "success",
    unqualified: "danger",
    converted: "purple",
  };
  return map[status] ?? "gray";
}

export function getDealStageVariant(stage: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    prospecting: "gray",
    qualification: "info",
    proposal: "warning",
    negotiation: "purple",
    closed_won: "success",
    closed_lost: "danger",
  };
  return map[stage] ?? "gray";
}

export function getPriorityVariant(priority: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    low: "gray",
    medium: "warning",
    high: "danger",
  };
  return map[priority] ?? "gray";
}
