import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save, Trash2, Settings, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FittingRule {
  id: string;
  rule_type: string;
  condition: string;
  value: string;
  recommendation: string;
  priority: number;
  active: boolean;
  created_at: string;
}

const ruleTypes = [
  { value: "length_adjustment", label: "Length Adjustment" },
  { value: "lie_angle", label: "Lie Angle" },
  { value: "shaft_flex", label: "Shaft Flex" },
  { value: "shaft_weight", label: "Shaft Weight" },
  { value: "hybrid_gapping", label: "Hybrid/FW Gapping" },
  { value: "wedge_gapping", label: "Wedge Gapping" },
  { value: "putter_toe_hang", label: "Putter Toe Hang" },
];

export default function AdminRules() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<FittingRule[]>([]);
  const [selectedType, setSelectedType] = useState("length_adjustment");
  const [editingRule, setEditingRule] = useState<FittingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for new/edit rule
  const [formData, setFormData] = useState({
    rule_type: "length_adjustment",
    condition: "",
    value: "",
    recommendation: "",
    priority: 1,
    active: true,
  });

  useEffect(() => {
    if (!user) return;

    checkAdminAccess();
    loadRules();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
    }
  };

  const loadRules = async () => {
    setIsLoading(true);
    
    const { data } = await supabase
      .from("fitting_rules")
      .select("*")
      .order("rule_type", { ascending: true })
      .order("priority", { ascending: true });

    if (data) {
      setRules(data);
    }

    setIsLoading(false);
  };

  const filteredRules = rules.filter(r => r.rule_type === selectedType);

  const openDialog = (rule?: FittingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_type: rule.rule_type,
        condition: rule.condition,
        value: rule.value,
        recommendation: rule.recommendation,
        priority: rule.priority,
        active: rule.active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        rule_type: selectedType,
        condition: "",
        value: "",
        recommendation: "",
        priority: 1,
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const saveRule = async () => {
    if (!user) return;

    setIsSaving(true);

    try {
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from("fitting_rules")
          .update({
            condition: formData.condition,
            value: formData.value,
            recommendation: formData.recommendation,
            priority: formData.priority,
            active: formData.active,
          })
          .eq("id", editingRule.id);

        if (error) throw error;

        // Log the change
        await supabase.from("user_activity_logs").insert({
          user_id: user.id,
          action: "update",
          entity_type: "fitting_rule",
          entity_id: editingRule.id,
          details: { before: editingRule, after: formData },
        });

        toast({
          title: "Rule updated",
          description: "Fitting rule has been updated successfully.",
        });
      } else {
        // Create new rule
        const { data: newRule, error } = await supabase
          .from("fitting_rules")
          .insert({
            rule_type: formData.rule_type,
            condition: formData.condition,
            value: formData.value,
            recommendation: formData.recommendation,
            priority: formData.priority,
            active: formData.active,
          })
          .select()
          .single();

        if (error) throw error;

        // Log the creation
        if (newRule) {
          await supabase.from("user_activity_logs").insert({
            user_id: user.id,
            action: "create",
            entity_type: "fitting_rule",
            entity_id: newRule.id,
            details: { rule: formData },
          });
        }

        toast({
          title: "Rule created",
          description: "New fitting rule has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      loadRules();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast({
        title: "Error",
        description: "Failed to save rule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this rule?")) return;

    const ruleToDelete = rules.find(r => r.id === ruleId);

    const { error } = await supabase
      .from("fitting_rules")
      .delete()
      .eq("id", ruleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule.",
        variant: "destructive",
      });
      return;
    }

    // Log the deletion
    await supabase.from("user_activity_logs").insert({
      user_id: user.id,
      action: "delete",
      entity_type: "fitting_rule",
      entity_id: ruleId,
      details: { deleted_rule: ruleToDelete },
    });

    toast({
      title: "Rule deleted",
      description: "Fitting rule has been deleted successfully.",
    });

    loadRules();
  };

  const toggleRuleActive = async (rule: FittingRule) => {
    if (!user) return;

    const { error } = await supabase
      .from("fitting_rules")
      .update({ active: !rule.active })
      .eq("id", rule.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update rule status.",
        variant: "destructive",
      });
      return;
    }

    // Log the change
    await supabase.from("user_activity_logs").insert({
      user_id: user.id,
      action: "update",
      entity_type: "fitting_rule",
      entity_id: rule.id,
      details: { active_changed: { from: rule.active, to: !rule.active } },
    });

    loadRules();
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        
        <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
              <Settings className="w-8 h-8 text-accent" />
              Fitting Rules Management
            </h1>
            <p className="text-muted-foreground">
              Manage the decision rules used by the recommendation engine. Changes take effect immediately.
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              These rules control how recommendations are generated. Be careful when modifying them — invalid rules may produce incorrect fitting results.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rule Configuration</CardTitle>
                  <CardDescription>
                    View and edit fitting rules by category
                  </CardDescription>
                </div>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedType} onValueChange={setSelectedType}>
                <TabsList className="grid grid-cols-7 w-full">
                  {ruleTypes.map(type => (
                    <TabsTrigger key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {ruleTypes.map(type => (
                  <TabsContent key={type.value} value={type.value} className="mt-6">
                    {filteredRules.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>No rules configured for this category.</p>
                        <Button onClick={() => openDialog()} variant="outline" className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Rule
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Priority</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Recommendation</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRules.map(rule => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{rule.priority}</TableCell>
                              <TableCell className="max-w-[200px]">{rule.condition}</TableCell>
                              <TableCell>{rule.value}</TableCell>
                              <TableCell className="max-w-[300px]">{rule.recommendation}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={rule.active}
                                  onCheckedChange={() => toggleRuleActive(rule)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDialog(rule)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteRule(rule.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Footer />

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Rule" : "Add New Rule"}</DialogTitle>
              <DialogDescription>
                {editingRule ? "Update the fitting rule details below." : "Create a new fitting rule."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rule_type">Rule Type</Label>
                <Select
                  value={formData.rule_type}
                  onValueChange={(val) => setFormData({ ...formData, rule_type: val })}
                  disabled={!!editingRule}
                >
                  <SelectTrigger id="rule_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g., height_ft >= 6 AND wrist_to_floor >= 37"
                />
                <p className="text-xs text-muted-foreground">
                  Define when this rule applies (e.g., swing_speed = '95-100', wrist_to_floor {'>'} 37)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., +0.5 or Stiff"
                />
                <p className="text-xs text-muted-foreground">
                  The adjustment or value to apply (e.g., +0.5 inches, Stiff flex, 2° upright)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="recommendation">Recommendation</Label>
                <Input
                  id="recommendation"
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  placeholder="Plain-English explanation for users"
                />
                <p className="text-xs text-muted-foreground">
                  User-friendly explanation of this rule
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers = higher priority</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="active">Active</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveRule} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}