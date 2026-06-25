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
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Eye, Download, Clock, CheckCircle2, Target, Home, User, Settings, FileText, Trophy, BarChart, Ruler } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadSessions = async () => {
      const { data, error } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setSessions(data);
      }
      setIsLoading(false);
    };

    loadSessions();
  }, [user]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-64 mb-4" />
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <Sidebar>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard">
                          <Home className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/fitting/new">
                          <Play className="h-4 w-4" />
                          <span>New Fitting</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/clubs">
                          <Trophy className="h-4 w-4" />
                          <span>Club Database</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/clubs/compare">
                          <BarChart className="h-4 w-4" />
                          <span>Compare Clubs</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/profile/settings">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Resources</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/how-it-works">
                          <FileText className="h-4 w-4" />
                          <span>How It Works</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/blog">
                          <FileText className="h-4 w-4" />
                          <span>Blog</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/support">
                          <FileText className="h-4 w-4" />
                          <span>Support</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <Navigation />
            
            <div className="flex-1">
              <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                  <SidebarTrigger className="lg:hidden" />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      Welcome back, {user?.user_metadata?.full_name || user?.email}
                    </h1>
                    <p className="text-muted-foreground">Manage your fitting sessions</p>
                  </div>
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
                    <Link href="/fitting/new">
                      <Play className="h-5 w-5 mr-2" />
                      Start New Fitting
                    </Link>
                  </Button>
                </div>

                {sessions.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <Target className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Start Your First Fitting</h3>
                        <p className="text-muted-foreground mb-6">
                          Get personalized club recommendations with Prime Swing Fits' guided fitting wizard.
                        </p>
                        <Button size="lg" asChild>
                          <Link href="/fitting/new">
                            Begin Fitting Process
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">
                                  Fitting Session
                                </h3>
                                {session.status === "in_progress" ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    In Progress
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
                                {session.completed_at && (
                                  <p>Completed: {new Date(session.completed_at).toLocaleDateString()}</p>
                                )}
                                {session.status === "in_progress" && (
                                  <p>Current Step: {session.current_step} of 6</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {session.status === "in_progress" ? (
                                <Button asChild>
                                  <Link href={`/fitting/${session.id}/step/${session.current_step}`}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume
                                  </Link>
                                </Button>
                              ) : (
                                <>
                                  <Button asChild>
                                    <Link href={`/fitting/${session.id}/results`}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Results
                                    </Link>
                                  </Button>
                                  <Button variant="outline" asChild>
                                    <Link href={`/fitting/${session.id}/report`}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Report
                                    </Link>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Footer />
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}