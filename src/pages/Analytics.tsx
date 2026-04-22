import { BarChart3, TrendingUp, Clock, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { api } from "@/lib/api";

interface AnalyticsSummary {
  totalBudget: number;
  totalSpent: number;
  avgCompletion: number;
  avgPlanDeviation: number;
  thisMonthRevenue: number;
  objectProgress: { name: string; plan: number; fact: number }[];
  monthlyTrend: { month: string; revenue: number; expenses: number }[];
}

function fmt(n: number) {
  return `${(n / 1_000_000).toFixed(1)} млн ₸`;
}

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics"],
    queryFn: () => api.get("/analytics/summary"),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Аналитика для руководителя"
        description="Единая картина бизнеса — прогресс, бюджет, проблемы"
        icon={<BarChart3 size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Общий бюджет" value={data ? fmt(data.totalBudget) : "—"} icon={<Banknote size={20} />} />
          <StatCard title="Освоено" value={data ? fmt(data.totalSpent) : "—"} change={data ? `${Math.round((data.totalSpent / data.totalBudget) * 100)}% от бюджета` : undefined} changeType="neutral" icon={<TrendingUp size={20} />} />
          <StatCard title="Средн. выполнение" value={data ? `${data.avgCompletion}%` : "—"} change={data ? (data.avgPlanDeviation >= 0 ? `Опережение ${data.avgPlanDeviation}%` : `Отставание ${Math.abs(data.avgPlanDeviation)}%`) : undefined} changeType={data && data.avgPlanDeviation >= 0 ? "positive" : "negative"} icon={<Clock size={20} />} />
          <StatCard title="Выручка (месяц)" value={data ? fmt(data.thisMonthRevenue) : "—"} icon={<BarChart3 size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Object Progress Chart */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Выполнение по объектам (%)</h2>
            {isLoading ? (
              <div className="h-[220px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.objectProgress ?? []} barGap={4} margin={{ left: -20, right: 5, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="plan" name="План" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fact" name="Факт" fill="hsl(22, 90%, 52%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Revenue Trend */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Доходы и расходы (млн ₸)</h2>
            {isLoading ? (
              <div className="h-[220px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.monthlyTrend ?? []} margin={{ left: -20, right: 5, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" name="Доходы" stroke="hsl(22, 90%, 52%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="expenses" name="Расходы" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly summary */}
        <div className="bg-card rounded-xl border p-4 md:p-6">
          <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Прогресс по объектам</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {(data?.objectProgress ?? []).map((obj, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">{obj.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Выполнение</span>
                    <span className={obj.fact >= obj.plan ? "text-success" : "text-destructive"}>
                      {obj.fact}% / {obj.plan}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${obj.fact}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {obj.fact >= obj.plan ? "✓ В графике" : `⚠ Отставание ${obj.plan - obj.fact}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
