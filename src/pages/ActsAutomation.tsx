import { FileCheck, FileSpreadsheet, Download, Eye, Wallet } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Act {
  id: string;
  type: string;
  name: string;
  number: string | null;
  amount: number | null;
  date: string | null;
  status: string;
  project: { name: string };
  createdAt: string;
}

const fmtMoney = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

const TYPE_LABELS: Record<string, string> = {
  KS2: "КС-2", KS3: "КС-3", M29: "М-29", AOSR: "АОСР", OTHER: "Другое",
};

type Status = "DRAFT" | "IN_REVIEW" | "AWAITING_SIGNATURE" | "DONE";

const STATUS_ORDER: Status[] = ["DRAFT", "IN_REVIEW", "AWAITING_SIGNATURE", "DONE"];

const statusStyles: Record<Status, string> = {
  DRAFT: "bg-muted text-muted-foreground border-muted",
  IN_REVIEW: "bg-warning/10 text-warning border-warning/30",
  AWAITING_SIGNATURE: "bg-primary/10 text-primary border-primary/30",
  DONE: "bg-success/10 text-success border-success/30",
};

const statusLabels: Record<Status, string> = {
  DRAFT: "Черновик",
  IN_REVIEW: "На проверке",
  AWAITING_SIGNATURE: "Ожидает подпись",
  DONE: "Готово",
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
}

export default function ActsAutomation() {
  const queryClient = useQueryClient();

  const { data: acts, isLoading } = useQuery<Act[]>({
    queryKey: ["acts"],
    queryFn: () => api.get("/acts"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      api.patch<Act>(`/acts/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acts"] });
    },
  });

  const total = acts?.length ?? 0;
  const done = acts?.filter((a) => a.status === "DONE").length ?? 0;
  const inReview = acts?.filter((a) => a.status === "IN_REVIEW").length ?? 0;
  const totalAmount = acts?.reduce((s, a) => s + (a.amount ?? 0), 0) ?? 0;

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
          <StatCard title="Сумма выполнения" value={isLoading ? "—" : fmtMoney.format(totalAmount)} icon={<Wallet size={20} />} />
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-4 md:p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold">Реестр актов</h2>
            <button
              type="button"
              onClick={() => api.download("/acts/export").catch((e) => alert(`Ошибка экспорта: ${e.message}`))}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition"
            >
              <FileSpreadsheet size={14} /> Выгрузить в Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground">Тип</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground">Объект</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">Документ</th>
                  <th className="text-right px-4 md:px-6 py-3 font-medium text-muted-foreground">Сумма</th>
                  <th className="text-left px-4 md:px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">Дата</th>
                  <th className="text-center px-4 md:px-6 py-3 font-medium text-muted-foreground">Статус</th>
                  <th className="text-center px-4 md:px-6 py-3 font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-6 py-3">
                          <div className="h-5 bg-muted animate-pulse rounded" />
                        </td>
                      </tr>
                    ))
                  : (acts ?? []).map((act) => (
                      <tr key={act.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 md:px-6 py-3 font-medium text-primary">{TYPE_LABELS[act.type] ?? act.type}</td>
                        <td className="px-4 md:px-6 py-3">{act.project?.name ?? "—"}</td>
                        <td className="px-4 md:px-6 py-3 text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{act.name}</td>
                        <td className="px-4 md:px-6 py-3 text-right tabular-nums font-medium">{act.amount != null ? fmtMoney.format(act.amount) : "—"}</td>
                        <td className="px-4 md:px-6 py-3 text-muted-foreground hidden md:table-cell">{act.date ? fmtDate(act.date) : "—"}</td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <select
                            value={act.status}
                            disabled={updateStatus.isPending}
                            onChange={(e) =>
                              updateStatus.mutate({ id: act.id, status: e.target.value as Status })
                            }
                            className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${statusStyles[act.status as Status] ?? ""} disabled:opacity-50`}
                          >
                            {STATUS_ORDER.map((s) => (
                              <option key={s} value={s}>
                                {statusLabels[s]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 md:px-6 py-3 text-center">
                          <button
                            type="button"
                            title="Скачать КС-3 (XLSX)"
                            onClick={() =>
                              api
                                .download(`/acts/${act.id}/export`)
                                .catch((e) => alert(`Ошибка экспорта: ${e.message}`))
                            }
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
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
