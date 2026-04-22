import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HardHat, Building2, FileCheck, Users, FileText,
  BarChart3, Calculator, Search, TrendingUp, AlertTriangle,
  Clock, CheckCircle,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface DashboardStats {
  activeProjects: number;
  planCompletion: number;
  planVsFact: number;
  openIncidents: number;
  criticalIncidents: number;
  actsInProgress: number;
  actsInReview: number;
  recentActivity: { id: string; text: string; icon: string; createdAt: string }[];
}

const modules = [
  { path: "/app/pto", icon: HardHat, label: "ИИ-ассистент ПТО", desc: "КС-2, М-29, журналы, графики" },
  { path: "/app/digital-construction", icon: Building2, label: "Цифровая стройка", desc: "Учёт материалов, объёмов, ИД" },
  { path: "/app/acts", icon: FileCheck, label: "Автоматизация актов", desc: "КС-2, КС-3, М-29, АОСР" },
  { path: "/app/subcontractors", icon: Users, label: "Субподрядчики", desc: "Контроль выполнения и оплат" },
  { path: "/app/documentation", icon: FileText, label: "ИИ-документация", desc: "Поиск, генерация, шаблоны" },
  { path: "/app/analytics", icon: BarChart3, label: "Аналитика", desc: "Сводки, прогресс, бюджет" },
  { path: "/app/accounting", icon: Calculator, label: "ИИ-бухгалтер", desc: "Приходы, расходы, налоги" },
  { path: "/app/tenders", icon: Search, label: "Поиск тендеров", desc: "Мониторинг, фильтрация, подача" },
];

const iconMap: Record<string, React.ReactNode> = {
  "file-check": <FileCheck size={16} />,
  "alert-triangle": <AlertTriangle size={16} className="text-warning" />,
  "search": <Search size={16} />,
  "check-circle": <CheckCircle size={16} className="text-success" />,
  "file-text": <FileText size={16} />,
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return "Вчера";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardStats>("/dashboard/stats"),
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b px-4 py-5 sm:px-8 sm:py-8">
        <p className="text-[10px] text-primary tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>§ 01 — ПАНЕЛЬ УПРАВЛЕНИЯ</p>
        <h1 className="text-2xl sm:text-4xl uppercase" style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 0.95 }}>ТОО «СК-Казалем»</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">Строительно-дорожная компания · ИИ-автоматизация управления стройкой</p>
      </div>

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Активные объекты"
            value={isLoading ? "—" : String(data?.activeProjects ?? 0)}
            icon={<Building2 size={22} />}
          />
          <StatCard
            title="Выполнение плана"
            value={isLoading ? "—" : `${data?.planCompletion ?? 0}%`}
            change={data ? (data.planVsFact >= 0 ? `Опережение на ${data.planVsFact}%` : `Отставание ${Math.abs(data.planVsFact)}%`) : undefined}
            changeType={data && data.planVsFact >= 0 ? "positive" : "negative"}
            icon={<TrendingUp size={22} />}
          />
          <StatCard
            title="Открытые инциденты"
            value={isLoading ? "—" : String(data?.openIncidents ?? 0)}
            change={data ? `${data.criticalIncidents} критических` : undefined}
            changeType="negative"
            icon={<AlertTriangle size={22} />}
          />
          <StatCard
            title="Актов в работе"
            value={isLoading ? "—" : String(data?.actsInProgress ?? 0)}
            change={data ? `${data.actsInReview} на проверке` : undefined}
            changeType="neutral"
            icon={<Clock size={22} />}
          />
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Модули системы</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {modules.map((m) => (
              <div
                key={m.path}
                onClick={() => navigate(m.path)}
                className="module-card group"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <m.icon size={20} />
                </div>
                <h3 className="font-medium text-xs sm:text-sm">{m.label}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Последние события</h2>
          <div className="space-y-3">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 rounded bg-muted animate-pulse" />
                ))
              : (data?.recentActivity ?? []).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="text-muted-foreground">{iconMap[event.icon] ?? <FileText size={16} />}</div>
                    <p className="text-sm flex-1">{event.text}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(event.createdAt)}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
