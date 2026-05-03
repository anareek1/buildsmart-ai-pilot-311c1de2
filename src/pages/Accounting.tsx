import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, ArrowDownCircle, ArrowUpCircle, Landmark, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Account {
  id: string;
  code: string;
  name: string;
  startDebit: number;
  startCredit: number;
  turnoverDebit: number;
  turnoverCredit: number;
  endDebit: number;
  endCredit: number;
}

interface BankTx {
  id: string;
  date: string;
  docNumber: string | null;
  counterparty: string | null;
  debit: number;
  credit: number;
  purpose: string | null;
  category: string | null;
}

interface BankSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  txCount: number;
  byCategory: { name: string; expense: number; income: number; count: number }[];
  monthlyTrend: { month: string; income: number; expense: number }[];
}

const fmtMoney = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 });
const fmtMln = (n: number) => `${(n / 1_000_000).toFixed(1)} млн ₸`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("ru-RU");

export default function Accounting() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: summary } = useQuery<BankSummary>({
    queryKey: ["bank-summary"],
    queryFn: () => api.get("/accounting/bank/summary"),
  });
  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => api.get("/accounting/accounts"),
  });
  const { data: transactions } = useQuery<BankTx[]>({
    queryKey: ["bank-transactions"],
    queryFn: () => api.get("/accounting/bank"),
  });

  const filtered = useMemo(() => {
    if (!transactions) return [];
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (category !== "all" && (t.category ?? "Прочее") !== category) return false;
      if (!q) return true;
      return (
        (t.counterparty ?? "").toLowerCase().includes(q) ||
        (t.purpose ?? "").toLowerCase().includes(q) ||
        (t.docNumber ?? "").includes(q)
      );
    });
  }, [transactions, search, category]);

  const importantAccounts = useMemo(
    () =>
      (accounts ?? [])
        .filter(
          (a) =>
            a.turnoverDebit + a.turnoverCredit > 0 ||
            Math.abs(a.endDebit - a.endCredit) > 100_000,
        )
        .slice(0, 25),
    [accounts],
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-бухгалтер"
        description="Оборотно-сальдовая ведомость, банковские движения, налоги"
        icon={<Calculator size={22} />}
      />

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Поступления"
            value={summary ? fmtMln(summary.totalIncome) : "—"}
            change="за период данных"
            changeType="positive"
            icon={<ArrowDownCircle size={20} />}
          />
          <StatCard
            title="Списания"
            value={summary ? fmtMln(summary.totalExpense) : "—"}
            change={summary ? `${summary.txCount} операций` : undefined}
            changeType="negative"
            icon={<ArrowUpCircle size={20} />}
          />
          <StatCard
            title="Сальдо"
            value={summary ? fmtMln(summary.balance) : "—"}
            change={summary && summary.balance < 0 ? "отток денег" : "приток"}
            changeType={summary && summary.balance >= 0 ? "positive" : "negative"}
            icon={<Landmark size={20} />}
          />
          <StatCard
            title="Счетов в ОСВ"
            value={accounts ? String(accounts.length) : "—"}
            icon={<Calculator size={20} />}
          />
        </div>

        {summary && summary.monthlyTrend.length > 0 && (
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold text-sm mb-3">Поступления и списания по месяцам</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={summary.monthlyTrend} margin={{ left: 0, right: 5, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => fmtMln(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" name="Приход" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Расход" fill="hsl(22, 90%, 52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {summary && (
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold text-sm mb-3">Структура движений по категориям</h2>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left pb-2">Категория</th>
                  <th className="text-right pb-2">Расход</th>
                  <th className="text-right pb-2">Приход</th>
                  <th className="text-right pb-2">Операций</th>
                </tr>
              </thead>
              <tbody>
                {summary.byCategory.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2 text-right tabular-nums text-destructive">{c.expense > 0 ? fmtMoney.format(c.expense) : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-success">{c.income > 0 ? fmtMoney.format(c.income) : "—"}</td>
                    <td className="py-2 text-right text-muted-foreground">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-card rounded-xl border p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="font-semibold text-sm">Банковские движения ({filtered.length})</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Все категории</option>
                {(summary?.byCategory ?? []).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Контрагент / назначение..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2">Дата</th>
                  <th className="text-left py-2">Контрагент</th>
                  <th className="text-left py-2">Назначение</th>
                  <th className="text-left py-2">Категория</th>
                  <th className="text-right py-2">Расход</th>
                  <th className="text-right py-2">Приход</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-1.5 text-muted-foreground whitespace-nowrap">{fmtDate(t.date)}</td>
                    <td className="py-1.5 max-w-[180px] truncate" title={t.counterparty ?? ""}>{t.counterparty}</td>
                    <td className="py-1.5 max-w-[260px] truncate text-muted-foreground" title={t.purpose ?? ""}>{t.purpose}</td>
                    <td className="py-1.5">
                      {t.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{t.category}</span>
                      )}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-destructive">{t.debit > 0 ? fmtMoney.format(t.debit) : ""}</td>
                    <td className="py-1.5 text-right tabular-nums text-success">{t.credit > 0 ? fmtMoney.format(t.credit) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">Показаны первые 200 из {filtered.length}. Используйте поиск/фильтр.</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Оборотно-сальдовая ведомость</h2>
            <span className="text-xs text-muted-foreground">показаны активные счета</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2">Счёт</th>
                  <th className="text-left py-2">Наименование</th>
                  <th className="text-right py-2">Сальдо нач. (Дт)</th>
                  <th className="text-right py-2">Оборот Дт</th>
                  <th className="text-right py-2">Оборот Кт</th>
                  <th className="text-right py-2">Сальдо кон. (Дт)</th>
                  <th className="text-right py-2">Сальдо кон. (Кт)</th>
                </tr>
              </thead>
              <tbody>
                {importantAccounts.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="py-1.5 font-mono text-[10px]">{a.code}</td>
                    <td className="py-1.5">{a.name}</td>
                    <td className="py-1.5 text-right tabular-nums">{a.startDebit > 0 ? fmtMoney.format(a.startDebit) : ""}</td>
                    <td className="py-1.5 text-right tabular-nums">{a.turnoverDebit > 0 ? fmtMoney.format(a.turnoverDebit) : ""}</td>
                    <td className="py-1.5 text-right tabular-nums">{a.turnoverCredit > 0 ? fmtMoney.format(a.turnoverCredit) : ""}</td>
                    <td className="py-1.5 text-right tabular-nums">{a.endDebit > 0 ? fmtMoney.format(a.endDebit) : ""}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">{a.endCredit > 0 ? fmtMoney.format(a.endCredit) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
