import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { DeviceIntegrationService } from "@/lib/deviceIntegration/deviceService";
import type { SwingData } from "@/lib/deviceIntegration/types";

interface ProgressChartsProps {
  userId: string;
}

type TimeRange = "7d" | "30d" | "90d" | "all";
type MetricType = "ball_speed" | "carry_distance" | "smash_factor" | "spin_rate" | "launch_angle";

interface DataPoint {
  date: string;
  value: number;
  count: number;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

export function ProgressCharts({ userId }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("ball_speed");
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [userId, timeRange, selectedMetric]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: swingData } = await DeviceIntegrationService.getSwingData(userId, {
        startDate: startDate.toISOString(),
        limit: 1000,
      });

      if (!swingData || swingData.length === 0) {
        setChartData([]);
        setTrendData(null);
        setLoading(false);
        return;
      }

      // Group data by date and calculate daily averages
      const groupedData = swingData.reduce((acc, swing) => {
        const date = swing.swing_date.split("T")[0];
        const value = swing[selectedMetric];

        if (value !== null && value !== undefined) {
          if (!acc[date]) {
            acc[date] = { total: 0, count: 0 };
          }
          acc[date].total += value;
          acc[date].count += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; count: number }>);

      // Convert to array and calculate averages
      const points: DataPoint[] = Object.entries(groupedData)
        .map(([date, { total, count }]) => ({
          date,
          value: total / count,
          count,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setChartData(points);

      // Calculate trend
      if (points.length >= 2) {
        const midpoint = Math.floor(points.length / 2);
        const firstHalf = points.slice(0, midpoint);
        const secondHalf = points.slice(midpoint);

        const firstAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;

        const change = secondAvg - firstAvg;
        const changePercent = (change / firstAvg) * 100;

        setTrendData({
          current: secondAvg,
          previous: firstAvg,
          change,
          changePercent,
          trend: Math.abs(changePercent) < 1 ? "stable" : changePercent > 0 ? "up" : "down",
        });
      } else {
        setTrendData(null);
      }
    } catch (error) {
      console.error("Failed to load chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const metricConfig: Record<MetricType, { label: string; unit: string; decimals: number; color: string }> = {
    ball_speed: { label: "Ball Speed", unit: "mph", decimals: 1, color: "#22C55E" },
    carry_distance: { label: "Carry Distance", unit: "yds", decimals: 0, color: "#3B82F6" },
    smash_factor: { label: "Smash Factor", unit: "", decimals: 2, color: "#F59E0B" },
    spin_rate: { label: "Spin Rate", unit: "rpm", decimals: 0, color: "#8B5CF6" },
    launch_angle: { label: "Launch Angle", unit: "°", decimals: 1, color: "#EC4899" },
  };

  const config = metricConfig[selectedMetric];

  const formatValue = (value: number) => {
    return value.toFixed(config.decimals) + (config.unit ? ` ${config.unit}` : "");
  };

  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  const minValue = Math.min(...chartData.map((d) => d.value), maxValue);
  const range = maxValue - minValue || 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Swing Trend Analysis</CardTitle>
            <CardDescription>Track your improvement over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricConfig).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No data available for selected period</p>
            <p className="text-sm text-muted-foreground">Start recording swings to see your progress</p>
          </div>
        ) : (
          <>
            {/* Trend Summary */}
            {trendData && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Average</p>
                    <p className="text-2xl font-bold">{formatValue(trendData.current)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {trendData.trend === "up" && (
                        <>
                          <TrendingUp className="h-5 w-5 text-accent" />
                          <Badge className="bg-accent text-white">
                            +{Math.abs(trendData.changePercent).toFixed(1)}%
                          </Badge>
                        </>
                      )}
                      {trendData.trend === "down" && (
                        <>
                          <TrendingDown className="h-5 w-5 text-red-500" />
                          <Badge variant="destructive">
                            {trendData.changePercent.toFixed(1)}%
                          </Badge>
                        </>
                      )}
                      {trendData.trend === "stable" && (
                        <>
                          <Minus className="h-5 w-5 text-muted-foreground" />
                          <Badge variant="secondary">Stable</Badge>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {trendData.change > 0 ? "+" : ""}
                      {formatValue(trendData.change)} vs. previous period
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="relative h-64">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="800" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />

                {/* Data line */}
                <polyline
                  fill="none"
                  stroke={config.color}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={chartData
                    .map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 800;
                      const y = 200 - ((point.value - minValue) / range) * 200;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Data points */}
                {chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 800;
                  const y = 200 - ((point.value - minValue) / range) * 200;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="4" fill={config.color} stroke="white" strokeWidth="2" />
                      <title>
                        {point.date}: {formatValue(point.value)} ({point.count} shots)
                      </title>
                    </g>
                  );
                })}

                {/* Area fill */}
                <polygon
                  fill={config.color}
                  fillOpacity="0.1"
                  points={
                    chartData
                      .map((point, index) => {
                        const x = (index / (chartData.length - 1)) * 800;
                        const y = 200 - ((point.value - minValue) / range) * 200;
                        return `${x},${y}`;
                      })
                      .join(" ") + " 800,200 0,200"
                  }
                />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
                <span>{formatValue(maxValue)}</span>
                <span>{formatValue((maxValue + minValue) / 2)}</span>
                <span>{formatValue(minValue)}</span>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Best</p>
                <p className="font-semibold">{formatValue(maxValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Average</p>
                <p className="font-semibold">
                  {formatValue(chartData.reduce((sum, p) => sum + p.value, 0) / chartData.length)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Shots</p>
                <p className="font-semibold">{chartData.reduce((sum, p) => sum + p.count, 0)}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}