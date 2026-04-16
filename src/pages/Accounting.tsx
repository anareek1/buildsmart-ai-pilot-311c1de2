import { Calculator, TrendingUp, TrendingDown, Receipt, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const expenseCategories = [
  { name: "Материалы", value: 14200, color: "hsl(22, 90%, 52%)" },
  { name: "Зарплата", value: 8500, color: "hsl(22, 70%, 65%)" },
  { name: "Субподряд", value: 6800, color: "hsl(30, 50%, 60%)" },
  { name: "Техника", value: 3200, color: "hsl(30, 30%, 70%)" },
  { name: "Накладные", value: 2800, color: "hsl(30, 20%, 80%)" },
];

const monthlyFlow = [
  { month: "Янв", income: 18500, expense: 15200 },
  { month: "Фев", income: 22000, expense: 19800 },
  { month: "Мар", income: 35400, expense: 28100 },
  { month: "Апр", income: 12800, expense: 11500 },
];

const recentTransactions = [
  { desc: "Оплата от ТОО «АстанаСтрой» — КС-3", amount: "+12 450 000 ₸", type: "income", date: "08.04" },
  { desc: "Оплата субподрядчику «МонолитСтрой»", amount: "-4 200 000 ₸", type: "expense", date: "07.04" },
  { desc: "Закуп арматуры Ø12 — ТОО «МеталлТрейд»", amount: "-2 850 000 ₸", type: "expense", date: "06.04" },
  { desc: "Оплата от УКС — школа №14", amount: "+5 800 000 ₸", type: "income", date: "05.04" },
  { desc: "Зарплата — март 2026", amount: "-8 500 000 ₸", type: "expense", date: "05.04" },
  { desc: "НДС к уплате — 1 кв. 2026", amount: "-3 420 000 ₸", type: "tax", date: "03.04" },
];

const taxes = [
  { name: "НДС (12%)", amount: "3 420 000 ₸", deadline: "25.04.2026", status: "К оплате" },
  { name: "КПН (20%)", amount: "1 860 000 ₸", deadline: "10.04.2026", status: "Оплачен" },
  { name: "ИПН + СО", amount: "1 275 000 ₸", deadline: "25.04.2026", status: "К оплате" },
  { name: "ОПВ + ВОСМС", amount: "980 000 ₸", deadline: "25.04.2026", status: "К оплате" },
];

export default function Accounting() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-помощник бухгалтера"
        description="Учёт доходов, расходов, налогов и финансовая аналитика"
        icon={<Calculator size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Доходы (апрель)" value="12.8 млн ₸" change="-64% к марту" changeType="neutral" icon={<TrendingUp size={20} />} />
          <StatCard title="Расходы (апрель)" value="11.5 млн ₸" icon={<TrendingDown size={20} />} />
          <StatCard title="Прибыль (апрель)" value="1.3 млн ₸" change="Маржа 10.2%" changeType="positive" icon={<Receipt size={20} />} />
          <StatCard title="Налоги к уплате" value="5.68 млн ₸" change="Дедлайн 25.04" changeType="negative" icon={<Percent size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Cash Flow */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Денежный поток (тыс. ₸)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyFlow} barGap={4} margin={{ left: -10, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v / 1000}`} />
                <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(1)} млн ₸`} />
                <Bar dataKey="income" name="Доходы" fill="hsl(142, 60%, 40%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Расходы" fill="hsl(22, 90%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Структура расходов (март)</h2>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <ResponsiveContainer width="100%" height={180} className="sm:!w-1/2">
                <PieChart>
                  <Pie data={expenseCategories} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {expenseCategories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(1)} млн ₸`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full sm:w-1/2">
                {expenseCategories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                    <span className="text-muted-foreground ml-auto">{(cat.value / 1000).toFixed(1)} млн</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Последние операции</h2>
            <div className="space-y-2">
              {recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "income" ? "bg-success/10" : tx.type === "tax" ? "bg-primary/10" : "bg-destructive/10"}`}>
                    {tx.type === "income" ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className={tx.type === "tax" ? "text-primary" : "text-destructive"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{tx.desc}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap ${tx.type === "income" ? "text-success" : ""}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Calendar */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Налоговый календарь — Апрель 2026</h2>
            <div className="space-y-3">
              {taxes.map((tax, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{tax.name}</p>
                    <p className="text-xs text-muted-foreground">Срок: {tax.deadline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tax.amount}</p>
                    <span className={`text-xs ${tax.status === "Оплачен" ? "text-success" : "text-warning"}`}>
                      {tax.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                💡 <strong>ИИ-подсказка:</strong> С 01.01.2026 порог НДС снижен до 40 млн ₸. При текущей выручке компания обязана уплачивать НДС ежеквартально.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
