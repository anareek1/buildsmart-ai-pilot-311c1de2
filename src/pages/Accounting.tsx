import { Calculator, TrendingUp, TrendingDown, Receipt, Percent, ArrowUpRight, ArrowDownRight, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { useState } from "react";

interface AccountingSummary {
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthProfit: number;
  taxDue: number;
  recentTransactions: { id: string; type: string; description: string; amount: number; date: string }[];
  taxes: { id: string; name: string; amount: number; deadline: string; paid: boolean }[];
  expenseCategories: { name: string; value: number }[];
  monthlyFlow?: { month: string; income: number; expense: number }[];
}

interface ChatMessage { role: "user" | "assistant"; content: string }

const COLORS = [
  "hsl(22, 90%, 52%)", "hsl(22, 70%, 65%)", "hsl(30, 50%, 60%)", "hsl(30, 30%, 70%)", "hsl(30, 20%, 80%)",
];

function fmt(n: number) { return `${(Math.abs(n) / 1_000_000).toFixed(1)} млн ₸`; }
function fmtDate(d: string) { const dt = new Date(d); return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}`; }

export default function Accounting() {
  const { data, isLoading } = useQuery<AccountingSummary>({
    queryKey: ["accounting"],
    queryFn: () => api.get("/accounting/summary"),
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setQuery("");
    setSending(true);
    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { module: "accounting", messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Ошибка. Попробуйте ещё раз." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-помощник бухгалтера"
        description="Учёт доходов, расходов, налогов и финансовая аналитика"
        icon={<Calculator size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Доходы (месяц)" value={data ? fmt(data.thisMonthIncome) : "—"} icon={<TrendingUp size={20} />} />
          <StatCard title="Расходы (месяц)" value={data ? fmt(data.thisMonthExpenses) : "—"} icon={<TrendingDown size={20} />} />
          <StatCard title="Прибыль (месяц)" value={data ? fmt(data.thisMonthProfit) : "—"} change={data ? `Маржа ${Math.round((data.thisMonthProfit / (data.thisMonthIncome || 1)) * 100)}%` : undefined} changeType="positive" icon={<Receipt size={20} />} />
          <StatCard title="Налоги к уплате" value={data ? fmt(data.taxDue) : "—"} changeType="negative" icon={<Percent size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Expense Breakdown */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Структура расходов</h2>
            {isLoading ? (
              <div className="h-[180px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <ResponsiveContainer width="100%" height={180} className="sm:!w-1/2">
                  <PieChart>
                    <Pie data={data?.expenseCategories ?? []} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {(data?.expenseCategories ?? []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full sm:w-1/2">
                  {(data?.expenseCategories ?? []).map((cat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span>{cat.name}</span>
                      <span className="text-muted-foreground ml-auto">{fmt(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Chat */}
          <div className="bg-card rounded-xl border p-4 md:p-6 flex flex-col">
            <h2 className="font-semibold mb-3 text-sm md:text-base">ИИ-помощник бухгалтера</h2>
            <div className="bg-muted rounded-lg p-3 mb-3 min-h-[140px] flex-1 overflow-y-auto space-y-2 text-sm">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-xs">Спросите о налогах, расходах или финансовом анализе...</p>
              ) : messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {sending && <div className="text-xs text-muted-foreground">Думаю...</div>}
            </div>
            <div className="flex gap-2">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Введите вопрос..." className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={sendMessage} disabled={sending} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Transactions */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Последние операции</h2>
            <div className="space-y-2">
              {(data?.recentTransactions ?? []).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "INCOME" ? "bg-success/10" : tx.type === "TAX" ? "bg-primary/10" : "bg-destructive/10"}`}>
                    {tx.type === "INCOME" ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className={tx.type === "TAX" ? "text-primary" : "text-destructive"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap ${tx.type === "INCOME" ? "text-success" : ""}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{fmt(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Calendar */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Налоговый календарь</h2>
            <div className="space-y-3">
              {(data?.taxes ?? []).map((tax) => (
                <div key={tax.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{tax.name}</p>
                    <p className="text-xs text-muted-foreground">Срок: {fmtDate(tax.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{fmt(tax.amount)}</p>
                    <span className={`text-xs ${tax.paid ? "text-success" : "text-warning"}`}>
                      {tax.paid ? "Оплачен" : "К оплате"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>ИИ-подсказка:</strong> С 01.01.2026 порог НДС снижен до 40 млн ₸. При текущей выручке компания обязана уплачивать НДС ежеквартально.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
