import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GoalWizardProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onGoalCreated: () => void;
}

export function GoalWizard({ open, onClose, userId, onGoalCreated }: GoalWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goalName: "",
    metricName: "",
    targetValue: "",
    targetDate: null as Date | null,
    notes: "",
  });

  const metrics = [
    { value: "club_speed", label: "Club Speed (mph)" },
    { value: "ball_speed", label: "Ball Speed (mph)" },
    { value: "carry_distance", label: "Carry Distance (yards)" },
    { value: "total_distance", label: "Total Distance (yards)" },
    { value: "consistency_score", label: "Consistency Score" },
  ];

  async function handleSubmit() {
    try {
      const { error } = await supabase.from("swing_goals").insert({
        user_id: userId,
        goal_name: formData.goalName,
        metric_name: formData.metricName,
        target_value: parseFloat(formData.targetValue),
        target_date: formData.targetDate ? format(formData.targetDate, "yyyy-MM-dd") : null,
        notes: formData.notes || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: "Your swing improvement goal has been set!",
      });

      onGoalCreated();
      handleClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    }
  }

  function handleClose() {
    setStep(1);
    setFormData({
      goalName: "",
      metricName: "",
      targetValue: "",
      targetDate: null,
      notes: "",
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Improvement Goal - Step {step}/3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="e.g., Increase driver distance"
                value={formData.goalName}
                onChange={(e) =>
                  setFormData({ ...formData, goalName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="metric">Metric to Track</Label>
              <Select
                value={formData.metricName}
                onValueChange={(value) =>
                  setFormData({ ...formData, metricName: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!formData.goalName || !formData.metricName}
              className="w-full"
            >
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="target">Target Value</Label>
              <Input
                id="target"
                type="number"
                step="0.1"
                placeholder="Enter target value"
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData({ ...formData, targetValue: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.find((m) => m.value === formData.metricName)?.label}
              </p>
            </div>

            <div>
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.targetDate ? (
                      format(formData.targetDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate || undefined}
                    onSelect={(date) =>
                      setFormData({ ...formData, targetDate: date || null })
                    }
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.targetValue || !formData.targetDate}
                className="flex-1"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this goal..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-semibold mb-2">Goal Summary</h4>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-muted-foreground inline">Goal:</dt>
                  <dd className="inline ml-2">{formData.goalName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground inline">Metric:</dt>
                  <dd className="inline ml-2">
                    {metrics.find((m) => m.value === formData.metricName)?.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground inline">Target:</dt>
                  <dd className="inline ml-2">{formData.targetValue}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground inline">Deadline:</dt>
                  <dd className="inline ml-2">
                    {formData.targetDate && format(formData.targetDate, "PPP")}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Create Goal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}