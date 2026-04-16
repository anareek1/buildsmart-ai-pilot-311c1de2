import { BarChart3, TrendingUp, Clock, Banknote } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const objectProgress = [
  { name: "ЖК «Астана»", plan: 80, fact: 78 },
  { name: "Водопровод", plan: 65, fact: 70 },
  { name: "Дорога А-351", plan: 45, fact: 42 },
  { name: "Школа №14", plan: 30, fact: 25 },
];

const budgetData = [
  { name: "ЖК «Астана»", value: 89.2, color: "hsl(22, 90%, 52%)" },
  { name: "Водопровод", value: 34.5, color: "hsl(22, 70%, 65%)" },
  { name: "Дорога А-351", value: 22.0, color: "hsl(30, 50%, 70%)" },
  { name: "Школа №14", value: 15.8, color: "hsl(30, 30%, 80%)" },
];

const monthlyTrend = [
  { month: "Янв", revenue: 18.5, expenses: 15.2 },
  { month: "Фев", revenue: 22.0, expenses: 19.8 },
  { month: "Мар", revenue: 35.4, expenses: 28.1 },
];

export default function Analytics() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Аналитика для руководителя"
        description="Единая картина бизнеса — прогресс, бюджет, проблемы"
        icon={<BarChart3 size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Общий бюджет" value="161.5 млн ₸" icon={<Banknote size={20} />} />
          <StatCard title="Освоено" value="102.3 млн ₸" change="63% от бюджета" changeType="neutral" icon={<TrendingUp size={20} />} />
          <StatCard title="Средн. выполнение" value="54%" change="Отставание 2%" changeType="negative" icon={<Clock size={20} />} />
          <StatCard title="Выручка (март)" value="35.4 млн ₸" change="+61% к февралю" changeType="positive" icon={<BarChart3 size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Object Progress Chart */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Выполнение по объектам (%)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={objectProgress} barGap={4} margin={{ left: -20, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="plan" name="План" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fact" name="Факт" fill="hsl(22, 90%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Доходы и расходы (млн ₸)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ left: -20, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" name="Доходы" stroke="hsl(22, 90%, 52%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expenses" name="Расходы" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly summary */}
        <div className="bg-card rounded-xl border p-4 md:p-6">
          <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Еженедельная сводка — 7-13 апреля 2026</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {objectProgress.map((obj, i) => (
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
