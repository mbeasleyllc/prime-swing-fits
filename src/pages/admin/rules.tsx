import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FittingRule {
  id: string;
  rule_name: string;
  input_field: string;
  input_value: string;
  output_field: string;
  output_value: string;
  priority: number;
}

export default function AdminRules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<FittingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FittingRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
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
    loadRules();
  }, [user]);

  const loadRules = async () => {
    const { data, error } = await supabase
      .from("fitting_rules")
      .select("*")
      .order("priority", { ascending: false });

    if (data) {
      setRules(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRule) {
      const { error } = await supabase
        .from("fitting_rules")
        .update({
          rule_name: formData.rule_name,
          input_field: formData.input_field,
          input_value: formData.input_value,
          output_field: formData.output_field,
          output_value: formData.output_value,
          priority: formData.priority,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingRule.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update rule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Rule Updated",
        description: "Fitting rule updated successfully",
      });
    } else {
      const { error } = await supabase.from("fitting_rules").insert([formData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create rule",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Rule Created",
        description: "New fitting rule created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingRule(null);
    setFormData({
      rule_name: "",
      input_field: "",
      input_value: "",
      output_field: "",
      output_value: "",
      priority: 1,
    });
    loadRules();
  };

  const handleEdit = (rule: FittingRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      input_field: rule.input_field,
      input_value: rule.input_value,
      output_field: rule.output_field,
      output_value: rule.output_value,
      priority: rule.priority,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRuleId) return;

    const { error } = await supabase
      .from("fitting_rules")
      .delete()
      .eq("id", deletingRuleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rule Deleted",
      description: "Fitting rule removed successfully",
    });

    setIsDeleteDialogOpen(false);
    setDeletingRuleId(null);
    loadRules();
  };

  const openDeleteDialog = (ruleId: string) => {
    setDeletingRuleId(ruleId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <AppLayout>
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96" />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fitting Rules</h1>
              <p className="text-muted-foreground">Manage recommendation engine logic</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingRule(null);
                  setFormData({
                    rule_name: "",
                    input_field: "",
                    input_value: "",
                    output_field: "",
                    output_value: "",
                    priority: 1,
                  });
                }} className="bg-gold text-gold-foreground hover:bg-gold/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingRule ? "Edit Rule" : "Add New Rule"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule_name">Rule Name</Label>
                    <Input
                      id="rule_name"
                      value={formData.rule_name}
                      onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="input_field">Input Field</Label>
                      <Input
                        id="input_field"
                        value={formData.input_field}
                        onChange={(e) => setFormData({ ...formData, input_field: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input_value">Input Value</Label>
                      <Input
                        id="input_value"
                        value={formData.input_value}
                        onChange={(e) => setFormData({ ...formData, input_value: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="output_field">Output Field</Label>
                      <Input
                        id="output_field"
                        value={formData.output_field}
                        onChange={(e) => setFormData({ ...formData, output_field: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output_value">Output Value</Label>
                      <Input
                        id="output_value"
                        value={formData.output_value}
                        onChange={(e) => setFormData({ ...formData, output_value: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">
                      {editingRule ? "Update Rule" : "Create Rule"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Input Field</TableHead>
                      <TableHead>Input Value</TableHead>
                      <TableHead>Output Field</TableHead>
                      <TableHead>Output Value</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No rules defined yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">{rule.rule_name}</TableCell>
                          <TableCell>{rule.input_field}</TableCell>
                          <TableCell>{rule.input_value}</TableCell>
                          <TableCell>{rule.output_field}</TableCell>
                          <TableCell>{rule.output_value}</TableCell>
                          <TableCell>{rule.priority}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(rule.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Rule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this fitting rule? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    </ProtectedRoute>
  );
}