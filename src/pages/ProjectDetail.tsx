import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, MapPin, User, Calendar, FileText,
  Banknote, TrendingUp, Wallet, AlertTriangle, ArrowLeft, FileSpreadsheet,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "@/components/PageHeader";
import GenerateKS2Dialog from "@/components/GenerateKS2Dialog";
import SchedulePanel from "@/components/SchedulePanel";
import AttachmentsPanel from "@/components/AttachmentsPanel";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  type: string;
  address: string | null;
  customer: string | null;
  contractNumber: string | null;
  contractDate: string | null;
  endDate: string | null;
  budgetTotal: number | null;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
}

interface Act {
  id: string;
  name: string;
  number: string | null;
  amount: number | null;
  date: string | null;
  status: string;
}

interface Summary {
  project: Project;
  finance: {
    contract: number;
    done: number;
    remaining: number;
    completionPct: number;
    costsTotal: number;
    costsDebt: number;
    margin: number;
    marginPct: number;
  };
  acts: Act[];
  costs: {
    total: number;
    debt: number;
    byCategory: { name: string; value: number }[];
    count: number;
  };
  estimateCount: number;
}

const fmtMoney = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 });
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "В работе", COMPLETED: "Завершён", SUSPENDED: "Приостановлен",
  DRAFT: "Черновик", IN_REVIEW: "На проверке", AWAITING_SIGNATURE: "Ожидает подпись", DONE: "Готово",
};
const STATUS_CLASS: Record<string, string> = {
  ACTIVE: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success",
  SUSPENDED: "bg-warning/10 text-warning",
  DRAFT: "bg-muted text-muted-foreground",
  IN_REVIEW: "bg-warning/10 text-warning",
  AWAITING_SIGNATURE: "bg-primary/10 text-primary",
  DONE: "bg-success/10 text-success",
};

const COLORS = [
  "hsl(22, 90%, 52%)",
  "hsl(199, 89%, 48%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 65%, 55%)",
  "hsl(45, 93%, 50%)",
];

interface KpiProps { label: string; value: string; sub?: string; tone?: "default" | "success" | "danger" | "warning"; icon: React.ReactNode }
function Kpi({ label, value, sub, tone = "default", icon }: KpiProps) {
  const subColor =
    tone === "success" ? "text-success" :
    tone === "danger" ? "text-destructive" :
    tone === "warning" ? "text-warning" : "text-muted-foreground";
  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      {sub && <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ["project-summary", id],
    queryFn: () => api.get<Summary>(`/projects/${id}/summary`),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-sm text-muted-foreground">Загрузка…</div>;
  if (error || !data) return <div className="p-8 text-sm text-destructive">Ошибка загрузки проекта.</div>;

  const { project, finance, acts, costs, estimateCount } = data;
  const noContract = !project.budgetTotal;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={project.name}
        description={project.customer ?? "—"}
        icon={<Building2 size={22} />}
      />

      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/app/digital-construction" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> К списку объектов
          </Link>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASS[project.status]}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>

        {/* Шапка: реквизиты */}
        <div className="bg-card rounded-xl border p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {project.address && (
            <div className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /><span>{project.address}</span></div>
          )}
          {project.customer && (
            <div className="flex items-center gap-2"><User size={14} className="text-muted-foreground" /><span className="truncate" title={project.customer}>{project.customer}</span></div>
          )}
          {project.contractNumber && (
            <div className="flex items-center gap-2"><FileText size={14} className="text-muted-foreground" /><span>Договор № {project.contractNumber}{project.contractDate && ` от ${fmtDate(project.contractDate)}`}</span></div>
          )}
          {project.endDate && (
            <div className="flex items-center gap-2"><Calendar size={14} className="text-muted-foreground" /><span>Срок: {fmtDate(project.endDate)}</span></div>
          )}
        </div>

        {/* Финансовые KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Договор" value={noContract ? "—" : fmtMoney.format(finance.contract)} icon={<FileText size={16} />} />
          <Kpi
            label="Освоено (КС-2)"
            value={fmtMoney.format(finance.done)}
            sub={!noContract ? `${finance.completionPct}% от договора` : undefined}
            tone="default"
            icon={<TrendingUp size={16} />}
          />
          <Kpi label="Остаток" value={fmtMoney.format(finance.remaining)} sub={noContract ? "договор не указан" : undefined} icon={<Banknote size={16} />} />
          <Kpi
            label="Маржа"
            value={fmtMoney.format(finance.margin)}
            sub={finance.done > 0 ? `${finance.marginPct}% от выручки` : "нет КС-2"}
            tone={finance.margin >= 0 ? "success" : "danger"}
            icon={<Wallet size={16} />}
          />
        </div>

        {/* Затраты */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Структура затрат</h2>
              <span className="text-xs text-muted-foreground">
                Всего: <span className="font-medium text-foreground">{fmtMoney.format(costs.total)}</span>
                {costs.debt > 0 && (
                  <> • <span className="text-destructive">долг {fmtMoney.format(costs.debt)}</span></>
                )}
              </span>
            </div>
            {costs.count === 0 ? (
              <p className="text-sm text-muted-foreground">Затраты не подключены для этого объекта.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={costs.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {costs.byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtMoney.format(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Сводка / быстрые действия */}
          <div className="bg-card rounded-xl border p-5 flex flex-col">
            <h2 className="font-semibold text-sm mb-3">Документы и операции</h2>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Локальная смета</span>
                <span className="font-medium">{estimateCount > 0 ? `${estimateCount} позиций` : "не загружена"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Актов КС-2</span>
                <span className="font-medium">{acts.length}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Записей о затратах</span>
                <span className="font-medium">{costs.count}</span>
              </div>
              {finance.margin < 0 && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-xs">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Затраты ({fmtMoney.format(costs.total)}) превышают выручку по актам ({fmtMoney.format(finance.done)}). Проверьте структуру расходов.</span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t mt-3">
              <GenerateKS2Dialog projectId={project.id} projectName={project.name} />
            </div>
          </div>
        </div>

        {/* ГПР — график производства работ */}
        <SchedulePanel projectId={project.id} />

        {/* Документы объекта */}
        <AttachmentsPanel projectId={project.id} />

        {/* Реестр актов */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm">Реестр актов КС-2</h2>
            <span className="text-xs text-muted-foreground">{acts.length} шт</span>
          </div>
          {acts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Актов пока нет.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left px-4 py-2">№</th>
                    <th className="text-left px-4 py-2">Документ</th>
                    <th className="text-left px-4 py-2">Дата</th>
                    <th className="text-right px-4 py-2">Сумма</th>
                    <th className="text-center px-4 py-2">Статус</th>
                    <th className="text-center px-4 py-2">XLSX</th>
                  </tr>
                </thead>
                <tbody>
                  {acts.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2 text-muted-foreground">{a.number ?? "—"}</td>
                      <td className="px-4 py-2">{a.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{a.date ? fmtDate(a.date) : <span className="italic">нет даты</span>}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium">
                        {a.amount != null ? fmtMoney.format(a.amount) : "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASS[a.status] ?? ""}`}>
                          {STATUS_LABELS[a.status] ?? a.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => api.download(`/acts/${a.id}/export`).catch((e) => alert(e.message))}
                          title="Скачать КС-2 (XLSX)"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <FileSpreadsheet size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
