import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  alerts: {
    type: "warning" | "info" | "success";
    message: string;
    icon?: "alert" | "trending" | "clock";
  }[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case "trending":
        return TrendingUp;
      case "clock":
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
      case "success":
        return "border-green-500 bg-green-50 dark:bg-green-950/20";
      default:
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const Icon = getIcon(alert.icon);
        return (
          <Alert key={index} className={cn("border-l-4", getAlertStyles(alert.type))}>
            <Icon className="h-4 w-4" />
            <AlertDescription className="ml-2">{alert.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
