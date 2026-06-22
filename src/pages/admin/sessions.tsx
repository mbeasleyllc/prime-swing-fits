import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Flag, Download, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      const { data, error } = await supabase
        .from("fitting_sessions")
        .select(`
          *,
          users(email),
          player_profile(handicap, dominant_hand)
        `)
        .order("created_at", { ascending: false });

      if (data) {
        setSessions(data);
        setFilteredSessions(data);
      }
      setIsLoading(false);
    };

    loadSessions();
  }, [user]);

  useEffect(() => {
    let filtered = sessions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [statusFilter, searchQuery, sessions]);

  const handleFlagSession = async (sessionId: string, currentlyFlagged: boolean) => {
    const { error } = await supabase
      .from("fitting_sessions")
      .update({ flagged: !currentlyFlagged })
      .eq("id", sessionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update session flag",
        variant: "destructive",
      });
      return;
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, flagged: !currentlyFlagged } : s))
    );

    toast({
      title: currentlyFlagged ? "Flag removed" : "Session flagged",
      description: currentlyFlagged ? "Session unmarked" : "Session marked for review",
    });
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["User Email", "Date", "Status", "Handicap", "Dominant Hand", "Flagged"],
      ...filteredSessions.map((s) => [
        s.users?.email || "",
        new Date(s.created_at).toLocaleDateString(),
        s.status,
        s.player_profile?.[0]?.handicap || "",
        s.player_profile?.[0]?.dominant_hand || "",
        s.flagged ? "Yes" : "No",
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proswing-sessions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "CSV Exported",
      description: `${filteredSessions.length} sessions exported successfully`,
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96" />
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Session Management</h1>
              <p className="text-muted-foreground">View and manage all fitting sessions</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by user email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Handicap</TableHead>
                    <TableHead>Hand</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className={session.flagged ? "bg-amber-50/50" : ""}
                      >
                        <TableCell className="font-medium">
                          {session.users?.email || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {new Date(session.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              session.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {session.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.player_profile?.[0]?.handicap || "N/A"}
                        </TableCell>
                        <TableCell className="capitalize">
                          {session.player_profile?.[0]?.dominant_hand || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {session.status === "completed" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/fitting/${session.id}/results`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant={session.flagged ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFlagSession(session.id, session.flagged)}
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}