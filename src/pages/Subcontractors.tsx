import { Users, AlertTriangle, CheckCircle, Banknote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Subcontractor {
  id: string;
  name: string;
  works: string;
  contractAmount: number;
  completion: number;
  paid: number;
  status: string;
}

interface SubcontractorsResponse {
  subs: Subcontractor[];
  summary: { total: number; totalContract: number; avgCompletion: number; risks: number };
}

function fmt(n: number) {
  return `${(n / 1_000_000).toFixed(1)} млн ₸`;
}

export default function Subcontractors() {
  const { data, isLoading } = useQuery<SubcontractorsResponse>({
    queryKey: ["subcontractors"],
    queryFn: () => api.get("/subcontractors"),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Координация субподрядчиков"
        description="Контроль выполнения, сверка объёмов и управление оплатами"
        icon={<Users size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Субподрядчики" value={data ? String(data.summary.total) : "—"} icon={<Users size={20} />} />
          <StatCard title="Общая сумма договоров" value={data ? fmt(data.summary.totalContract) : "—"} icon={<Banknote size={20} />} />
          <StatCard title="Среднее выполнение" value={data ? `${data.summary.avgCompletion}%` : "—"} icon={<CheckCircle size={20} />} />
          <StatCard title="Риски" value={data ? String(data.summary.risks) : "—"} change="Оплата > выполнения" changeType="negative" icon={<AlertTriangle size={20} />} />
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <h2 className="font-semibold">Реестр субподрядчиков</h2>
          </div>
          <div className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 h-20 animate-pulse bg-muted/30" />
                ))
              : (data?.subs ?? []).map((sub) => (
                  <div key={sub.id} className="p-4 md:p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm">{sub.name}</h3>
                        <p className="text-xs text-muted-foreground">{sub.works}</p>
                      </div>
                      <span className="text-xs md:text-sm font-medium whitespace-nowrap flex-shrink-0">
                        {fmt(sub.contractAmount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Выполнение</span>
                          <span className="font-medium">{sub.completion}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${sub.completion}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Оплачено</span>
                          <span className={`font-medium ${sub.status === "DANGER" ? "text-destructive" : ""}`}>
                            {sub.paid}%{sub.status === "DANGER" && " ⚠"}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${sub.status === "DANGER" ? "bg-destructive" : "bg-success"}`}
                            style={{ width: `${sub.paid}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
