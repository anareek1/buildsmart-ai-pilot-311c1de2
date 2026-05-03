import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, User, Calendar, ChevronDown, ChevronRight, FileText, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import GenerateKS2Dialog from "@/components/GenerateKS2Dialog";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  type: string;
  address: string | null;
  customer: string | null;
  endDate: string | null;
  budgetTotal: number | null;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
  progressFact: number;
  progressPlan: number;
}

interface EstimateItem {
  id: string;
  position: number;
  code: string | null;
  name: string;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

const statusLabel: Record<Project["status"], string> = {
  ACTIVE: "В работе",
  COMPLETED: "Завершён",
  SUSPENDED: "Приостановлен",
};

const statusClass: Record<Project["status"], string> = {
  ACTIVE: "bg-primary/10 text-primary",
  COMPLETED: "bg-success/10 text-success",
  SUSPENDED: "bg-warning/10 text-warning",
};

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "KZT", maximumFractionDigits: 0 });

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function EstimatePanel({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery<EstimateItem[]>({
    queryKey: ["estimate", projectId],
    queryFn: () => api.get<EstimateItem[]>(`/projects/${projectId}/estimate`),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground p-3">Загрузка сметы…</p>;
  if (error) return <p className="text-sm text-destructive p-3">Ошибка загрузки сметы</p>;
  if (!data || data.length === 0)
    return <p className="text-sm text-muted-foreground p-3">Локальная смета не загружена для этого объекта.</p>;

  const total = data.reduce((s, x) => s + x.total, 0);

  return (
    <div className="mt-3 border-t pt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="pb-1.5 text-left w-10">№</th>
            <th className="pb-1.5 text-left">Шифр</th>
            <th className="pb-1.5 text-left">Наименование</th>
            <th className="pb-1.5 text-right">Объём</th>
            <th className="pb-1.5 text-left">Ед.</th>
            <th className="pb-1.5 text-right">Цена</th>
            <th className="pb-1.5 text-right">Сумма</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
              <td className="py-1.5 text-muted-foreground">{item.position}</td>
              <td className="py-1.5 font-mono text-[10px] text-muted-foreground">{item.code ?? "—"}</td>
              <td className="py-1.5 pr-2">{item.name}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt.format(item.quantity)}</td>
              <td className="py-1.5 text-muted-foreground">{item.unit ?? "—"}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt.format(item.unitPrice)} ₸</td>
              <td className="py-1.5 text-right tabular-nums font-medium">{fmtMoney.format(item.total)}</td>
            </tr>
          ))}
          <tr className="font-semibold bg-muted/40">
            <td colSpan={6} className="py-1.5 text-right">ИТОГО по смете:</td>
            <td className="py-1.5 text-right tabular-nums">{fmtMoney.format(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function DigitalConstruction() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });

  const active = projects?.filter((p) => p.status === "ACTIVE").length ?? 0;
  const total = projects?.length ?? 0;
  const totalBudget = projects?.reduce((s, p) => s + (p.budgetTotal ?? 0), 0) ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Цифровая стройка"
        description="Операционное управление объектами"
        icon={<Building2 size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Активные объекты" value={String(active)} icon={<Building2 size={20} />} />
          <StatCard title="Всего объектов" value={String(total)} icon={<Building2 size={20} />} />
          <StatCard title="Стоимость договоров" value={fmtMoney.format(totalBudget)} icon={<FileText size={20} />} />
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Объекты строительства</h2>

          {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
          {error && (
            <p className="text-sm text-destructive">
              Ошибка загрузки: {error instanceof Error ? error.message : "неизвестная"}
            </p>
          )}

          <div className="space-y-3">
            {projects?.map((p) => {
              const isOpen = openId === p.id;
              return (
                <div key={p.id} className="rounded-lg border hover:border-primary/40 transition">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link
                        to={`/app/projects/${p.id}`}
                        className="text-sm font-medium leading-snug hover:text-primary inline-flex items-start gap-1.5 group"
                      >
                        {p.name}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition mt-0.5 flex-shrink-0" />
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass[p.status]}`}>
                        {statusLabel[p.status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      {p.address && (
                        <div className="flex items-center gap-1.5"><MapPin size={12} /><span>{p.address}</span></div>
                      )}
                      {p.customer && (
                        <div className="flex items-center gap-1.5"><User size={12} /><span className="truncate" title={p.customer}>{p.customer}</span></div>
                      )}
                      {p.endDate && (
                        <div className="flex items-center gap-1.5"><Calendar size={12} /><span>срок: {formatDate(p.endDate)}</span></div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                      {p.budgetTotal != null && (
                        <span className="text-xs text-muted-foreground">
                          Договор: <span className="font-medium text-foreground">{fmtMoney.format(p.budgetTotal)}</span>
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <GenerateKS2Dialog projectId={p.id} projectName={p.name} />
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : p.id)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          Локальная смета
                        </button>
                      </div>
                    </div>
                    {isOpen && <EstimatePanel projectId={p.id} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
