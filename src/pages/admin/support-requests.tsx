import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Trash2,
  Mail,
  Calendar,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/database.types";

type SupportRequest = Database["public"]["Tables"]["support_requests"]["Row"];

export default function SupportRequests() {
  return (
    <ProtectedRoute adminOnly>
      <SupportRequestsContent />
    </ProtectedRoute>
  );
}

function SupportRequestsContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("support_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching support requests:", error);
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "pending" | "resolved" | "spam") => {
    try {
      const { error } = await supabase
        .from("support_requests")
        .update({
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
          resolved_by: status === "resolved" ? user?.id : null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Request marked as ${status}`,
      });

      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("support_requests")
        .update({ admin_notes: adminNotes })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Notes Saved",
        description: "Admin notes updated successfully",
      });

      fetchRequests();
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this support request?")) return;

    try {
      const { error } = await supabase
        .from("support_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Request Deleted",
        description: "Support request removed",
      });

      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Requests</h1>
          <p className="text-muted-foreground">Manage customer support inquiries</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resolvedCount}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-accent text-white" : ""}
          >
            All ({requests.length})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            onClick={() => setFilter("resolved")}
            className={filter === "resolved" ? "bg-accent text-white" : ""}
          >
            Resolved ({resolvedCount})
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Clock className="h-6 w-6 animate-spin mr-2" />
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-1">No support requests found</p>
                <p className="text-sm">
                  {filter === "pending" ? "All caught up! No pending requests." : "No requests match the current filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <Badge
                            variant={request.status === "pending" ? "default" : "secondary"}
                            className={
                              request.status === "pending"
                                ? "bg-amber-500 text-white"
                                : request.status === "resolved"
                                ? "bg-accent text-white"
                                : "bg-red-500 text-white"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${request.email}`}
                            className="text-accent hover:underline flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-3 w-3" />
                            {request.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.subject}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.created_at!).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes(request.admin_notes || "");
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Support Request Details</span>
              <Badge
                variant={selectedRequest?.status === "pending" ? "default" : "secondary"}
                className={
                  selectedRequest?.status === "pending"
                    ? "bg-amber-500 text-white"
                    : selectedRequest?.status === "resolved"
                    ? "bg-accent text-white"
                    : "bg-red-500 text-white"
                }
              >
                {selectedRequest?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Request ID: {selectedRequest?.id.split("-")[0]}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground">{selectedRequest.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <a
                      href={`mailto:${selectedRequest.email}`}
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {selectedRequest.email}
                    </a>
                  </div>
                  {selectedRequest.order_number && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                      <p className="text-foreground font-mono">{selectedRequest.order_number}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <Badge variant="outline" className="ml-2">
                      {selectedRequest.subject}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                    <p className="text-foreground">
                      {new Date(selectedRequest.created_at!).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground">{selectedRequest.message}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
                    rows={4}
                    className="mb-4"
                  />
                  <Button onClick={saveAdminNotes} className="w-full bg-accent text-white hover:bg-accent/90">
                    Save Notes
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => updateStatus(selectedRequest.id, "resolved")}
                    className="flex-1 bg-accent text-white hover:bg-accent/90"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Resolved
                  </Button>
                )}
                {selectedRequest.status === "resolved" && (
                  <Button
                    onClick={() => updateStatus(selectedRequest.id, "pending")}
                    variant="outline"
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Reopen
                  </Button>
                )}
                <Button
                  onClick={() => updateStatus(selectedRequest.id, "spam")}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                >
                  Mark as Spam
                </Button>
                <Button
                  onClick={() => deleteRequest(selectedRequest.id)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}