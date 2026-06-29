import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeft, Database, Upload, PenTool } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVImport } from "@/components/swing-data/CSVImport";
import { ManualEntry } from "@/components/swing-data/ManualEntry";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SwingDataImport() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("csv");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const handleImportComplete = (sessionId: string) => {
    toast({
      title: "Import Successful",
      description: "Your swing data has been imported successfully.",
    });
    router.push(`/swing-data/sessions/${sessionId}`);
  };

  const handleManualSave = async (shotData: any) => {
    if (!user) return;

    try {
      if (!currentSessionId) {
        const { data: session, error: sessionError } = await supabase
          .from("swing_sessions")
          .insert({
            user_id: user.id,
            session_name: "Manual Entry Session",
            device_type: "manual",
            session_date: new Date().toISOString().split("T")[0],
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setCurrentSessionId(session.id);

        const { data: metrics, error: metricsError } = await supabase
          .from("swing_metrics")
          .select("shot_number")
          .eq("session_id", session.id)
          .order("shot_number", { ascending: false })
          .limit(1);

        const nextShotNumber = metrics && metrics.length > 0 ? (metrics[0].shot_number || 0) + 1 : 1;

        const { error: metricError } = await supabase.from("swing_metrics").insert({
          session_id: session.id,
          user_id: user.id,
          shot_number: nextShotNumber,
          ...shotData,
        });

        if (metricError) throw metricError;
      } else {
        const { data: metrics, error: metricsError } = await supabase
          .from("swing_metrics")
          .select("shot_number")
          .eq("session_id", currentSessionId)
          .order("shot_number", { ascending: false })
          .limit(1);

        const nextShotNumber = metrics && metrics.length > 0 ? (metrics[0].shot_number || 0) + 1 : 1;

        const { error: metricError } = await supabase.from("swing_metrics").insert({
          session_id: currentSessionId,
          user_id: user.id,
          shot_number: nextShotNumber,
          ...shotData,
        });

        if (metricError) throw metricError;
      }

      toast({
        title: "Shot Recorded",
        description: "Your shot has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save shot data",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to import swing data
          </p>
          <Link href="/auth/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO
        title="Import Swing Data - Prime Swing Fits"
        description="Import swing data from CSV files, launch monitors, or enter manually"
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Import Swing Data</h1>
          <p className="text-lg text-muted-foreground">
            Add swing data from your launch monitor or enter manually
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">
              <Upload className="w-4 h-4 mr-2" />
              CSV Import
            </TabsTrigger>
            <TabsTrigger value="manual">
              <PenTool className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-6">
            <CSVImport onImportComplete={handleImportComplete} userId={user.id} />

            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Download CSV Template
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started with our pre-formatted CSV template
              </p>
              <a href="/swing-data-template.csv" download="swing-data-template.csv">
                <Button variant="outline" size="sm">
                  Download Template
                </Button>
              </a>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <ManualEntry onSave={handleManualSave} />

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Tips for Manual Entry:</p>
              <ul className="space-y-1">
                <li>• Essential fields: Club, Ball Speed, Club Speed, Carry Distance</li>
                <li>• Advanced metrics are optional but recommended</li>
                <li>• Keep the same club selected for batch entry</li>
                <li>• Review session summary before finishing</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}