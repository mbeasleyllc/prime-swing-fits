import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { validateBatch, VALID_CLUBS, VALID_DEVICE_TYPES } from "@/lib/swingDataValidation";

interface CSVImportProps {
  onImportComplete: (sessionId: string) => void;
  userId: string;
}

interface ParsedRow {
  shot_number?: number;
  club_used?: string;
  ball_speed?: number;
  club_speed?: number;
  carry_distance?: number;
  total_distance?: number;
  launch_angle?: number;
  spin_rate?: number;
  smash_factor?: number;
  [key: string]: any;
}

export function CSVImport({ onImportComplete, userId }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [sessionName, setSessionName] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;

    setFile(csvFile);
    setSessionName(csvFile.name.replace(".csv", ""));

    Papa.parse(csvFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        return header
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "_")
          .replace(/[()]/g, "");
      },
      complete: (results) => {
        const data = results.data as ParsedRow[];
        
        // Auto-detect and normalize column names
        const normalizedData = data.map((row, index) => ({
          shot_number: row.shot_number || row.shot || index + 1,
          club_used: row.club_used || row.club || row.club_type,
          ball_speed: row.ball_speed || row.ballspeed,
          club_speed: row.club_speed || row.clubspeed,
          carry_distance: row.carry_distance || row.carry,
          total_distance: row.total_distance || row.total,
          launch_angle: row.launch_angle || row.launch,
          spin_rate: row.spin_rate || row.spin,
          smash_factor: row.smash_factor || row.smash,
          attack_angle: row.attack_angle,
          club_path: row.club_path,
          face_angle: row.face_angle,
          launch_direction: row.launch_direction,
          spin_axis: row.spin_axis,
          max_height: row.max_height,
          landing_angle: row.landing_angle,
          dynamic_loft: row.dynamic_loft,
          shot_type: row.shot_type,
        }));

        const preview = normalizedData.slice(0, 5);
        setPreviewData(preview);

        const validation = validateBatch(normalizedData);
        setValidationResult(validation);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file || !validationResult) return;

    setImporting(true);
    try {
      // TODO: Implement actual import to Supabase
      // 1. Create swing_session
      // 2. Insert swing_metrics
      
      setTimeout(() => {
        setImporting(false);
        onImportComplete("mock-session-id");
      }, 2000);
    } catch (error) {
      console.error("Import failed:", error);
      setImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setValidationResult(null);
    setSessionName("");
  };

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CSV Import</CardTitle>
          <CardDescription>
            Drag and drop your CSV file or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop your CSV file here</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Drop CSV file here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports TrackMan, FlightScope, Golf Daddy, and custom formats
                </p>
              </>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Headers in first row (flexible naming)</li>
              <li>• Minimum columns: club, ball speed, carry distance</li>
              <li>• Optional: club speed, launch angle, spin rate, etc.</li>
              <li>• Ball speed in mph (80-200)</li>
              <li>• Distance in yards (50-400)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Import Preview</CardTitle>
              <CardDescription>{file.name}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={resetImport}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationResult && (
            <div className="flex gap-3">
              <Badge variant={validationResult.invalidCount > 0 ? "destructive" : "default"}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {validationResult.validCount} Valid
              </Badge>
              {validationResult.invalidCount > 0 && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationResult.invalidCount} Invalid
                </Badge>
              )}
              {validationResult.warningCount > 0 && (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {validationResult.warningCount} Warnings
                </Badge>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Session Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Practice Session - Driver"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Preview (First 5 Rows)</h3>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shot</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Ball Speed</TableHead>
                    <TableHead>Club Speed</TableHead>
                    <TableHead>Carry</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Launch</TableHead>
                    <TableHead>Spin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.shot_number}</TableCell>
                      <TableCell>{row.club_used || "-"}</TableCell>
                      <TableCell>{row.ball_speed ? `${row.ball_speed} mph` : "-"}</TableCell>
                      <TableCell>{row.club_speed ? `${row.club_speed} mph` : "-"}</TableCell>
                      <TableCell>{row.carry_distance ? `${row.carry_distance} yd` : "-"}</TableCell>
                      <TableCell>{row.total_distance ? `${row.total_distance} yd` : "-"}</TableCell>
                      <TableCell>{row.launch_angle ? `${row.launch_angle}°` : "-"}</TableCell>
                      <TableCell>{row.spin_rate ? `${row.spin_rate} rpm` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {validationResult && validationResult.invalidCount > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {validationResult.invalidCount} rows have validation errors. Review data before importing.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={importing || !validationResult || validationResult.invalidCount > 0}
              className="flex-1"
            >
              {importing ? "Importing..." : `Import ${validationResult?.validCount || 0} Shots`}
            </Button>
            <Button variant="outline" onClick={resetImport}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}