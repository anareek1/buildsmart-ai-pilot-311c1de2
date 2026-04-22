import { FileCheck, FileSpreadsheet, Download, Eye, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Act {
  id: string;
  type: string;
  name: string;
  status: string;
  project: { name: string };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  KS2: "КС-2", KS3: "КС-3", M29: "М-29", AOSR: "АОСР", OTHER: "Другое",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  IN_REVIEW: "bg-warning/10 text-warning",
  DONE: "bg-success/10 text-success",
  AWAITING_SIGNATURE: "bg-primary/10 text-primary",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Черновик",
  IN_REVIEW: "На проверке",
  DONE: "Готово",
  AWAITING_SIGNATURE: "Ожидает подпись",
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
}

export default function ActsAutomation() {
  const { data: acts, isLoading } = useQuery<Act[]>({
    queryKey: ["acts"],
    queryFn: () => api.get("/acts"),
  });

  const total = acts?.length ?? 0;
  const done = acts?.filter((a) => a.status === "DONE").length ?? 0;
  const inReview = acts?.filter((a) => a.status === "IN_REVIEW").length ?? 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Автоматизация актов"
        description="Автоматическая генерация КС-2, КС-3, М-29, АОСР на основе данных объектов"
        icon={<FileCheck size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Всего актов" value={isLoading ? "—" : String(total)} icon={<FileSpreadsheet size={20} />} />
          <StatCard title="Готовы к отправке" value={isLoading ? "—" : String(done)} icon={<FileCheck size={20} />} />
          <StatCard title="На проверке" value={isLoading ? "—" : String(inReview)} icon={<Eye size={20} />} />
          <StatCard title="Просрочены" value="0" icon={<Clock size={20} />} />
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <h2 className="font-semibold">Реестр актов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground">Тип</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground">Объект</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">Документ</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">Дата</th>
                  <th className="text-center px-4 md:px-6 py-3 font-medium text-muted-foreground">Статус</th>
                  <th className="text-center px-4 md:px-6 py-3 font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-3">
                          <div className="h-5 bg-muted animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                  : (acts ?? []).map((act) => (
                      <tr key={act.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 md:px-6 py-3 font-medium text-primary">{TYPE_LABELS[act.type] ?? act.type}</td>
                        <td className="px-4 md:px-6 py-3">{act.project?.name ?? "—"}</td>
                        <td className="px-4 md:px-6 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{act.name}</td>
                        <td className="px-4 md:px-6 py-3 text-muted-foreground hidden md:table-cell">{fmtDate(act.createdAt)}</td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyles[act.status] ?? ""}`}>
                            {statusLabels[act.status] ?? act.status}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <button className="text-muted-foreground hover:text-primary transition-colors">
                            <Download size={16} />
                          </button>
                        </td>
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
