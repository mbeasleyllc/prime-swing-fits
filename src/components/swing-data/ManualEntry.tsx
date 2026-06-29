import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { VALID_CLUBS, VALID_SHOT_TYPES, validateSwingMetric } from "@/lib/swingDataValidation";

interface ManualEntryProps {
  onSave: (data: any) => Promise<void>;
  sessionId?: string;
}

export function ManualEntry({ onSave, sessionId }: ManualEntryProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [shotsInSession, setShotsInSession] = useState(0);
  const [formData, setFormData] = useState({
    club_used: "",
    ball_speed: "",
    club_speed: "",
    carry_distance: "",
    total_distance: "",
    launch_angle: "",
    spin_rate: "",
    smash_factor: "",
    attack_angle: "",
    club_path: "",
    face_angle: "",
    launch_direction: "",
    spin_axis: "",
    max_height: "",
    landing_angle: "",
    dynamic_loft: "",
    shot_type: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert to numeric values
    const numericData = {
      club_used: formData.club_used || null,
      ball_speed: formData.ball_speed ? parseFloat(formData.ball_speed) : null,
      club_speed: formData.club_speed ? parseFloat(formData.club_speed) : null,
      carry_distance: formData.carry_distance ? parseFloat(formData.carry_distance) : null,
      total_distance: formData.total_distance ? parseFloat(formData.total_distance) : null,
      launch_angle: formData.launch_angle ? parseFloat(formData.launch_angle) : null,
      spin_rate: formData.spin_rate ? parseInt(formData.spin_rate) : null,
      smash_factor: formData.smash_factor ? parseFloat(formData.smash_factor) : null,
      attack_angle: formData.attack_angle ? parseFloat(formData.attack_angle) : null,
      club_path: formData.club_path ? parseFloat(formData.club_path) : null,
      face_angle: formData.face_angle ? parseFloat(formData.face_angle) : null,
      launch_direction: formData.launch_direction ? parseFloat(formData.launch_direction) : null,
      spin_axis: formData.spin_axis ? parseFloat(formData.spin_axis) : null,
      max_height: formData.max_height ? parseFloat(formData.max_height) : null,
      landing_angle: formData.landing_angle ? parseFloat(formData.landing_angle) : null,
      dynamic_loft: formData.dynamic_loft ? parseFloat(formData.dynamic_loft) : null,
      shot_type: formData.shot_type || null,
    };

    const validation = validateSwingMetric(numericData);
    if (!validation.isValid) {
      alert(`Validation errors:\n${validation.errors.join("\n")}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(numericData);
      
      if (batchMode) {
        setShotsInSession(prev => prev + 1);
        setFormData({
          club_used: formData.club_used,
          ball_speed: "",
          club_speed: "",
          carry_distance: "",
          total_distance: "",
          launch_angle: "",
          spin_rate: "",
          smash_factor: "",
          attack_angle: "",
          club_path: "",
          face_angle: "",
          launch_direction: "",
          spin_axis: "",
          max_height: "",
          landing_angle: "",
          dynamic_loft: "",
          shot_type: "",
        });
      } else {
        setFormData({
          club_used: "",
          ball_speed: "",
          club_speed: "",
          carry_distance: "",
          total_distance: "",
          launch_angle: "",
          spin_rate: "",
          smash_factor: "",
          attack_angle: "",
          club_path: "",
          face_angle: "",
          launch_direction: "",
          spin_axis: "",
          max_height: "",
          landing_angle: "",
          dynamic_loft: "",
          shot_type: "",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quick Entry</CardTitle>
            <CardDescription>
              Manually record a single shot (takes ~60 seconds)
            </CardDescription>
          </div>
          {batchMode && (
            <Badge variant="secondary">
              <ListChecks className="w-3 h-3 mr-1" />
              {shotsInSession} shots
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button
            type="button"
            variant={batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setBatchMode(!batchMode);
              if (!batchMode) setShotsInSession(0);
            }}
          >
            <ListChecks className="w-4 h-4 mr-2" />
            {batchMode ? "Batch Mode Active" : "Enable Batch Mode"}
          </Button>
          {batchMode && (
            <p className="text-xs text-muted-foreground mt-2">
              Club stays selected. Add multiple shots to same session.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="club">Club *</Label>
            <Select value={formData.club_used} onValueChange={(v) => handleChange("club_used", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {VALID_CLUBS.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="ball_speed" className="text-sm">Ball Speed (mph) *</Label>
              <Input
                id="ball_speed"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={formData.ball_speed}
                onChange={(e) => handleChange("ball_speed", e.target.value)}
                placeholder="150.5"
                className="text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="club_speed" className="text-sm">Club Speed (mph) *</Label>
              <Input
                id="club_speed"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={formData.club_speed}
                onChange={(e) => handleChange("club_speed", e.target.value)}
                placeholder="105.2"
                className="text-base"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="carry_distance" className="text-sm">Carry Distance (yards) *</Label>
              <Input
                id="carry_distance"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={formData.carry_distance}
                onChange={(e) => handleChange("carry_distance", e.target.value)}
                placeholder="245.3"
                className="text-base"
                required
              />
            </div>

            <div>
              <Label htmlFor="total_distance" className="text-sm">Total Distance (yards)</Label>
              <Input
                id="total_distance"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={formData.total_distance}
                onChange={(e) => handleChange("total_distance", e.target.value)}
                placeholder="260.5"
                className="text-base"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Advanced Metrics
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show Advanced Metrics
              </>
            )}
          </Button>

          {showAdvanced && (
            <div className="space-y-3 sm:space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="launch_angle" className="text-sm">Launch Angle (°)</Label>
                  <Input
                    id="launch_angle"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={formData.launch_angle}
                    onChange={(e) => handleChange("launch_angle", e.target.value)}
                    placeholder="12.5"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="spin_rate" className="text-sm">Spin Rate (rpm)</Label>
                  <Input
                    id="spin_rate"
                    type="number"
                    inputMode="numeric"
                    value={formData.spin_rate}
                    onChange={(e) => handleChange("spin_rate", e.target.value)}
                    placeholder="2800"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="attack_angle" className="text-sm">Attack Angle (°)</Label>
                  <Input
                    id="attack_angle"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={formData.attack_angle}
                    onChange={(e) => handleChange("attack_angle", e.target.value)}
                    placeholder="3.2"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="club_path" className="text-sm">Club Path (°)</Label>
                  <Input
                    id="club_path"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={formData.club_path}
                    onChange={(e) => handleChange("club_path", e.target.value)}
                    placeholder="2.1"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="face_angle" className="text-sm">Face Angle (°)</Label>
                  <Input
                    id="face_angle"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={formData.face_angle}
                    onChange={(e) => handleChange("face_angle", e.target.value)}
                    placeholder="1.5"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="shot_type" className="text-sm">Shot Type</Label>
                  <Select value={formData.shot_type} onValueChange={(v) => handleChange("shot_type", v)}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_SHOT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={saving} className="w-full touch-manipulation min-h-[44px]">
            <Plus className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Add Shot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}