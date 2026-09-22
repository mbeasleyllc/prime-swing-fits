import { Ruler } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UnitToggleProps {
  unit: "imperial" | "metric";
  onUnitChange: (unit: "imperial" | "metric") => void;
  className?: string;
}

export function UnitToggle({ unit, onUnitChange, className = "" }: UnitToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Ruler className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
        Imperial
      </Label>
      <Switch
        id="unit-toggle"
        checked={unit === "metric"}
        onCheckedChange={(checked) => onUnitChange(checked ? "metric" : "imperial")}
      />
      <Label htmlFor="unit-toggle" className="text-sm text-muted-foreground">
        Metric
      </Label>
    </div>
  );
}