import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
  helpText?: string;
  status?: "excellent" | "good" | "warning" | "danger";
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  onClick,
  helpText,
  status,
}: StatCardProps) {
  const statusStyles = {
    excellent: "border-green-500 border-2",
    good: "border-primary border-2",
    warning: "border-orange-500 border-2",
    danger: "border-red-500 border-2",
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02]",
        status && statusStyles[status],
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {helpText && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{helpText}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium mt-2",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-muted-foreground">vs. período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
