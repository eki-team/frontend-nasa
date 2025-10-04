import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/UI/ErrorState";
import { getInsights } from "@/lib/api";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

const Insights = () => {
  const { t } = useTranslation();

  const { data: insights, isLoading, error } = useQuery({
    queryKey: ["insights"],
    queryFn: () => getInsights()
  });

  if (error) {
    return <ErrorState message={error.message} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t("insights.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("insights.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">
          {t("common.loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publications by Year */}
          <Card className="p-6 col-span-full">
            <h2 className="text-xl font-semibold mb-4">{t("insights.publicationsByYear")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights?.byYear || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Missions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("insights.topMissions")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights?.topMissions || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))">
                  {insights?.topMissions?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Outcome Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("insights.outcomeDistribution")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights?.outcomesDist || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--accent))">
                  {insights?.outcomesDist?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Consensus vs Disagreement */}
          <Card className="p-6 col-span-full">
            <h2 className="text-xl font-semibold mb-4">{t("insights.consensusVsDisagreement")}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights?.consensusVsDisagreement || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="consensus" stackId="a" fill="#10b981" name="Consensus" />
                <Bar dataKey="disagreement" stackId="a" fill="#ef4444" name="Disagreement" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Heatmap placeholder */}
          <Card className="p-6 col-span-full">
            <h2 className="text-xl font-semibold mb-4">{t("insights.entityOutcomeHeatmap")}</h2>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Heatmap visualization - Requires custom implementation</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Insights;
