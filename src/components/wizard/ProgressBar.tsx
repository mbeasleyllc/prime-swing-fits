import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  "Club Selection",
  "Player Profile",
  "Physical Info",
  "Swing Profile",
  "Equipment",
  "Goals",
  "Course Conditions",
  "Golf Ball",
  "Review"
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                    isCompleted && "bg-accent text-accent-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center max-w-[80px] hidden sm:block",
                    (isCurrent || isCompleted) ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {stepLabels[step]}
                </span>
              </div>
              {step < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors",
                    step < currentStep ? "bg-accent" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}