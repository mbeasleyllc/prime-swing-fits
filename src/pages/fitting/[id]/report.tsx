import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FittingReport() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [swingProfile, setSwingProfile] = useState<any>(null);
  const [courseConditions, setCourseConditions] = useState<any>(null);
  const [physicalProfile, setPhysicalProfile] = useState<any>(null);
  const [currentEquipment, setCurrentEquipment] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (!id || !user) return;

    const loadData = async () => {
      const sessionId = Array.isArray(id) ? id[0] : id;

      const [recRes, playerRes, swingRes, courseRes, physicalRes, equipmentRes] = await Promise.all([
        supabase.from("fitting_recommendations").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("player_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("swing_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("course_conditions").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("physical_profile").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
        supabase.from("current_equipment").select("*").eq("session_id", sessionId).eq("user_id", user.id).single(),
      ]);

      if (recRes.data) setRecommendations(recRes.data);
      if (playerRes.data) setPlayerProfile(playerRes.data);
      if (swingRes.data) setSwingProfile(swingRes.data);
      if (courseRes.data) setCourseConditions(courseRes.data);
      if (physicalRes.data) setPhysicalProfile(physicalRes.data);
      if (equipmentRes.data) setCurrentEquipment(equipmentRes.data);

      setIsLoading(false);
    };

    loadData();
  }, [id, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPdf(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      const filename = `Prime-Swing-Fits-Report-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "PDF Downloaded",
        description: "Your fitting report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-8">
          <Skeleton className="h-12 w-3/4 mb-8 mx-auto" />
          <Skeleton className="h-64 mb-6 max-w-4xl mx-auto" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!recommendations) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground">No report data found.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="no-print p-6 border-b bg-white flex items-center justify-between">
          <h2 className="text-xl font-semibold">Fitting Report Preview</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isGeneratingPdf}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        <div ref={reportRef} className="max-w-4xl mx-auto p-12 bg-white">
          <div className="mb-8 text-center border-b pb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">Prime Swing Fits</h1>
            <h2 className="text-2xl font-semibold text-foreground">Golf Club Fitting Report</h2>
          </div>

          <div className="mb-8">
            <p className="text-lg font-medium">{playerProfile?.full_name}</p>
            <p className="text-muted-foreground">
              Fitting Date: {session?.completed_at ? new Date(session.completed_at).toLocaleDateString() : ""}
            </p>
          </div>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Player Profile</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-muted-foreground">Age</dt><dd>{playerProfile?.age}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Dominant Hand</dt><dd className="capitalize">{playerProfile?.dominant_hand}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Experience Level</dt><dd className="capitalize">{playerProfile?.experience}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Handicap</dt><dd>{playerProfile?.handicap}</dd></div>
              <div className="col-span-2"><dt className="font-semibold text-muted-foreground">Primary Goal</dt><dd className="capitalize">{playerProfile?.primary_goal?.replace("_", " ")}</dd></div>
            </dl>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Swing Profile</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-muted-foreground">Typical Shot Shape</dt><dd className="capitalize">{swingProfile?.typical_shot}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Miss Tendency</dt><dd className="capitalize">{swingProfile?.miss_tendency}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Ball Flight</dt><dd className="capitalize">{swingProfile?.ball_flight}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Swing Tempo</dt><dd className="capitalize">{swingProfile?.swing_tempo}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Swing Strength</dt><dd className="capitalize">{swingProfile?.swing_strength}</dd></div>
            </dl>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Physical Measurements</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-muted-foreground">Height</dt><dd>{physicalProfile?.height_ft}' {physicalProfile?.height_in}"</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Wrist-to-Floor Distance</dt><dd>{physicalProfile?.wrist_to_floor} inches</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Hand Size</dt><dd className="capitalize">{physicalProfile?.hand_size?.replace("_", " ")}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Mobility Level</dt><dd className="capitalize">{physicalProfile?.mobility_limit}</dd></div>
            </dl>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Current Equipment</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-muted-foreground">Club Brand</dt><dd>{currentEquipment?.club_brand || "Not specified"}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Club Length</dt><dd className="capitalize">{currentEquipment?.club_length}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Shaft Flex</dt><dd>{currentEquipment?.shaft_flex}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Grip Size</dt><dd className="capitalize">{currentEquipment?.grip_size}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Satisfaction Rating</dt><dd>{currentEquipment?.satisfaction}/5</dd></div>
            </dl>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-primary mb-4 border-b pb-2">Course Conditions</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="font-semibold text-muted-foreground">Typical Turf Type</dt><dd className="capitalize">{courseConditions?.turf_type}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Typical Weather</dt><dd className="capitalize">{courseConditions?.typical_weather}</dd></div>
              <div><dt className="font-semibold text-muted-foreground">Ball Type</dt><dd className="capitalize">{courseConditions?.ball_used}</dd></div>
            </dl>
          </section>

          <section className="mb-8 bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
            <h3 className="text-2xl font-bold text-accent mb-6">FINAL RECOMMENDATIONS</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div><dt className="font-bold text-primary">Club Length Adjustment</dt><dd className="text-lg mt-1">{recommendations.club_length_adj}</dd></div>
              <div><dt className="font-bold text-primary">Lie Angle</dt><dd className="text-lg mt-1">{recommendations.lie_angle_adj}</dd></div>
              <div><dt className="font-bold text-primary">Grip Size</dt><dd className="text-lg mt-1 capitalize">{recommendations.grip_size_rec}</dd></div>
              <div><dt className="font-bold text-primary">Shaft Flex</dt><dd className="text-lg mt-1">{recommendations.shaft_flex_rec}</dd></div>
              <div><dt className="font-bold text-primary">Shaft Weight</dt><dd className="text-lg mt-1">{recommendations.shaft_weight}</dd></div>
              <div><dt className="font-bold text-primary">Club Type</dt><dd className="text-lg mt-1 capitalize">{recommendations.club_type_rec}</dd></div>
            </dl>
          </section>

          {/* Performance Predictions */}
          <section className="space-y-3 break-inside-avoid">
            <h2 className="text-xl font-bold text-primary border-b border-border pb-2">
              Performance Predictions
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Distance Gain</p>
                <p className="font-semibold">{recommendations.predicted_driver_gain}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted Accuracy Improvement</p>
                <p className="font-semibold">{recommendations.predicted_accuracy}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Predicted Consistency Improvement</p>
                <p className="font-semibold">{recommendations.predicted_consistency}</p>
              </div>
              <p className="text-xs text-muted-foreground italic mt-3">
                Note: These are estimates based on your input profile. Actual results depend on swing changes and club build quality.
              </p>
            </div>
          </section>

          {/* Gapping Analysis - Core and above */}
          {(playerProfile?.budget_range === "mid_range" || playerProfile?.budget_range === "premium") && (
            <section className="space-y-3 break-inside-avoid">
              <h2 className="text-xl font-bold text-primary border-b border-border pb-2">
                Gapping Analysis & Bag Configuration
              </h2>
              <div className="space-y-3">
                {recommendations.gaps_identified && recommendations.gaps_identified.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Gaps Identified:</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-sm">
                      {recommendations.gaps_identified.map((gap: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendations.redundancies && recommendations.redundancies.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Redundancies:</h4>
                    <ul className="list-disc list-inside space-y-0.5 text-sm">
                      {recommendations.redundancies.map((red: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">{red}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-sm mb-1">Recommended Bag Configuration:</h4>
                  <p className="text-sm bg-muted p-2 rounded">{recommendations.recommended_bag}</p>
                </div>
              </div>
            </section>
          )}

          {/* Confidence Scores - Premium only */}
          {playerProfile?.budget_range === "premium" && (
            <section className="space-y-3 break-inside-avoid">
              <h2 className="text-xl font-bold text-primary border-b border-border pb-2">
                Fit Confidence Scores
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Driver Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.driver_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${recommendations.driver_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Irons Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.irons_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${recommendations.irons_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Wedges Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.wedge_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${recommendations.wedge_confidence}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Putter Fit Confidence</span>
                    <span className="text-sm font-medium">{recommendations.putter_confidence}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${recommendations.putter_confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Full Bag Breakdown - Core and above */}
          {(playerProfile?.budget_range === "mid_range" || playerProfile?.budget_range === "premium") && (
            <section className="space-y-3 break-inside-avoid">
              <h2 className="text-xl font-bold text-primary border-b border-border pb-2">
                Complete Bag Breakdown
              </h2>
              <div className="space-y-2 text-sm">
                <div>
                  <h4 className="font-semibold mb-0.5">Driver</h4>
                  <p className="text-muted-foreground">{recommendations.driver_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5">Fairway Woods</h4>
                  <p className="text-muted-foreground">{recommendations.fairway_woods}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5">Hybrids</h4>
                  <p className="text-muted-foreground">{recommendations.hybrids}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5">Irons</h4>
                  <p className="text-muted-foreground">{recommendations.irons_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5">Wedges</h4>
                  <p className="text-muted-foreground">{recommendations.wedges_spec}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-0.5">Putter</h4>
                  <p className="text-muted-foreground">{recommendations.putter_spec}</p>
                </div>
              </div>
            </section>
          )}

          {recommendations.advisory_notes && (
            <section className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h3 className="text-xl font-bold text-amber-900 mb-4">Advisory Notes</h3>
              <div className="space-y-3">
                {recommendations.advisory_notes.split("\n\n").map((note: string, index: number) => (
                  <p key={index} className="text-sm text-amber-900 leading-relaxed">{note}</p>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Report generated by <strong className="text-primary">Prime Swing Fits</strong> • primeswingfits.app</p>
            <p className="mt-2">For educational and informational purposes only. Professional fitting recommended for optimal results.</p>
          </footer>
        </div>

        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}