import { Search, Radar, Shield, Zap, ExternalLink, Calendar, MapPin, Banknote, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useState } from "react";
import { api } from "@/lib/api";

interface Tender {
  id: string;
  title: string;
  customer: string;
  budget: number;
  deadline: string;
  region: string;
  match: number;
  status: string;
  source: string;
}

interface TendersResponse {
  tenders: Tender[];
  summary: { total: number; active: number; submitted: number; won: number; conversionRate: number };
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый", IN_PROGRESS: "В работе", SUBMITTED: "Подано", MISSED: "Пропущен", WON: "Победа", LOST: "Проигран",
};

const statusStyles: Record<string, string> = {
  NEW: "bg-success/10 text-success",
  IN_PROGRESS: "bg-primary/10 text-primary",
  SUBMITTED: "bg-info/10 text-info",
  MISSED: "bg-muted text-muted-foreground",
  WON: "bg-success/20 text-success",
  LOST: "bg-destructive/10 text-destructive",
};

function fmt(n: number) { return `${(n / 1_000_000).toFixed(1)} млн ₸`; }
function fmtDate(d: string) { const dt = new Date(d); return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`; }

export default function Tenders() {
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<TendersResponse>({
    queryKey: ["tenders", filter],
    queryFn: () => api.get(`/tenders${filter !== "all" ? `?status=${filter}` : ""}`),
  });

  const takeAction = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tenders/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenders"] }),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Поиск тендеров и объёмов"
        description="Мониторинг goszakup.gov.kz, Самрук-Казына — фильтрация, анализ, подготовка"
        icon={<Search size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Найдено" value={data ? String(data.summary.total) : "—"} icon={<Radar size={20} />} />
          <StatCard title="В работе" value={data ? String(data.summary.active) : "—"} icon={<Zap size={20} />} />
          <StatCard title="Подано" value={data ? String(data.summary.submitted) : "—"} change={data ? `${data.summary.won} победы` : undefined} changeType="positive" icon={<Shield size={20} />} />
          <StatCard title="Конверсия" value={data ? `${data.summary.conversionRate}%` : "—"} icon={<Star size={20} />} />
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-1">
          {["all", "NEW", "IN_PROGRESS", "SUBMITTED"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {f === "all" ? "Все" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Tender Cards */}
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)
            : (data?.tenders ?? []).map((tender) => (
                <div key={tender.id} className="bg-card rounded-xl border p-4 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[tender.status] ?? ""}`}>
                          {STATUS_LABELS[tender.status] ?? tender.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{tender.source}</span>
                      </div>
                      <h3 className="font-medium text-sm md:text-base">{tender.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{tender.customer}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                      <Star size={14} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">{tender.match}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Banknote size={14} />
                      <span className="font-medium text-foreground">{fmt(tender.budget)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar size={14} />
                      <span>до {fmtDate(tender.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin size={14} />
                      <span>{tender.region}</span>
                    </div>
                  </div>
                  {tender.status === "NEW" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => takeAction.mutate({ id: tender.id, status: "IN_PROGRESS" })}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                      >
                        Взять в работу
                      </button>
                      <button className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors flex items-center gap-1">
                        <ExternalLink size={14} /> Открыть
                      </button>
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
