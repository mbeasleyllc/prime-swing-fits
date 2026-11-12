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
  rule_name: string;
  input_field: string;
  input_value: string;
  output_field: string;
  output_value: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

const ruleCategories = [
  { value: "length", label: "Length Adjustment" },
  { value: "lie_angle", label: "Lie Angle" },
  { value: "shaft_flex", label: "Shaft Flex" },
  { value: "shaft_weight", label: "Shaft Weight" },
  { value: "gapping", label: "Hybrid/FW Gapping" },
  { value: "wedge", label: "Wedge Gapping" },
  { value: "putter", label: "Putter Specs" },
];

export default function AdminRules() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<FittingRule[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("length");
  const [editingRule, setEditingRule] = useState<FittingRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for new/edit rule
  const [formData, setFormData] = useState({
    rule_name: "",
    input_field: "",
    input_value: "",
    output_field: "",
    output_value: "",
    priority: 1,
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
      .order("priority", { ascending: true });

    if (data) {
      setRules(data);
    }

    setIsLoading(false);
  };

  // Filter rules by category based on rule_name prefix
  const filteredRules = rules.filter(r => 
    r.rule_name.toLowerCase().startsWith(selectedCategory)
  );

  const openDialog = (rule?: FittingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        rule_name: rule.rule_name,
        input_field: rule.input_field,
        input_value: rule.input_value,
        output_field: rule.output_field,
        output_value: rule.output_value,
        priority: rule.priority,
      });
    } else {
      setEditingRule(null);
      setFormData({
        rule_name: `${selectedCategory}_`,
        input_field: "",
        input_value: "",
        output_field: "",
        output_value: "",
        priority: 1,
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
            rule_name: formData.rule_name,
            input_field: formData.input_field,
            input_value: formData.input_value,
            output_field: formData.output_field,
            output_value: formData.output_value,
            priority: formData.priority,
          })
          .eq("id", editingRule.id);

        if (error) throw error;

        toast({
          title: "Rule updated",
          description: "Fitting rule has been updated successfully.",
        });
      } else {
        // Create new rule
        const { error } = await supabase
          .from("fitting_rules")
          .insert({
            rule_name: formData.rule_name,
            input_field: formData.input_field,
            input_value: formData.input_value,
            output_field: formData.output_field,
            output_value: formData.output_value,
            priority: formData.priority,
          });

        if (error) throw error;

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

    toast({
      title: "Rule deleted",
      description: "Fitting rule has been deleted successfully.",
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
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-7 w-full">
                  {ruleCategories.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {ruleCategories.map(cat => (
                  <TabsContent key={cat.value} value={cat.value} className="mt-6">
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
                            <TableHead>Rule Name</TableHead>
                            <TableHead>Input Field</TableHead>
                            <TableHead>Input Value</TableHead>
                            <TableHead>Output Field</TableHead>
                            <TableHead>Output Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRules.map(rule => (
                            <TableRow key={rule.id}>
                              <TableCell className="font-medium">{rule.priority}</TableCell>
                              <TableCell>{rule.rule_name}</TableCell>
                              <TableCell>{rule.input_field}</TableCell>
                              <TableCell>{rule.input_value}</TableCell>
                              <TableCell>{rule.output_field}</TableCell>
                              <TableCell>{rule.output_value}</TableCell>
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
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  placeholder="e.g., length_tall_player"
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this rule (use category prefix)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input_field">Input Field</Label>
                <Input
                  id="input_field"
                  value={formData.input_field}
                  onChange={(e) => setFormData({ ...formData, input_field: e.target.value })}
                  placeholder="e.g., wrist_to_floor"
                />
                <p className="text-xs text-muted-foreground">
                  The field to evaluate (e.g., wrist_to_floor, swing_speed, height_ft)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="input_value">Input Value / Condition</Label>
                <Input
                  id="input_value"
                  value={formData.input_value}
                  onChange={(e) => setFormData({ ...formData, input_value: e.target.value })}
                  placeholder="e.g., >39 or 95-100"
                />
                <p className="text-xs text-muted-foreground">
                  The value or range to match (e.g., {'>'}39, 95-100, slice)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="output_field">Output Field</Label>
                <Input
                  id="output_field"
                  value={formData.output_field}
                  onChange={(e) => setFormData({ ...formData, output_field: e.target.value })}
                  placeholder="e.g., length_adjustment"
                />
                <p className="text-xs text-muted-foreground">
                  The recommendation field to set
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="output_value">Output Value</Label>
                <Input
                  id="output_value"
                  value={formData.output_value}
                  onChange={(e) => setFormData({ ...formData, output_value: e.target.value })}
                  placeholder="e.g., +1.0"
                />
                <p className="text-xs text-muted-foreground">
                  The value to apply (e.g., +1.0, Stiff, 2° upright)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">Lower numbers = higher priority (evaluated first)</p>
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

// Force server-side rendering (skip static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}