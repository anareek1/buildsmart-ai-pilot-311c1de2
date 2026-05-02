import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, User, Calendar } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  type: string;
  address: string | null;
  customer: string | null;
  endDate: string | null;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED";
  progressFact: number;
  progressPlan: number;
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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DigitalConstruction() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => api.get<Project[]>("/projects"),
  });

  const active = projects?.filter((p) => p.status === "ACTIVE").length ?? 0;
  const total = projects?.length ?? 0;

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
          <StatCard title="Заказчик" value="ГУ ВКО" change="Управление автодорог" icon={<User size={20} />} />
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Объекты строительства</h2>

          {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
          {error && (
            <p className="text-sm text-destructive">
              Ошибка загрузки: {error instanceof Error ? error.message : "неизвестная"}
            </p>
          )}
          {projects && projects.length === 0 && (
            <p className="text-sm text-muted-foreground">Объектов пока нет.</p>
          )}

          <div className="space-y-3">
            {projects?.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border hover:border-primary/40 transition">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-medium leading-snug">{p.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusClass[p.status]}`}>
                    {statusLabel[p.status]}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  {p.address && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} />
                      <span>{p.address}</span>
                    </div>
                  )}
                  {p.customer && (
                    <div className="flex items-center gap-1.5">
                      <User size={12} />
                      <span className="truncate" title={p.customer}>{p.customer}</span>
                    </div>
                  )}
                  {p.endDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>срок: {formatDate(p.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
