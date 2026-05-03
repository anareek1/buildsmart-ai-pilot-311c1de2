import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { api } from "@/lib/api";

interface ChecklistItem {
  id: string;
  position: number;
  label: string;
  done: boolean;
  status: string | null;
  supervisor: string | null;
}

export default function ChecklistPanel({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["pto-checklist", projectId],
    queryFn: () => api.get<ChecklistItem[]>(`/pto/checklist?projectId=${projectId}`),
  });

  const toggle = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api.patch(`/pto/checklist/${id}`, { done }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pto-checklist", projectId] });
      qc.invalidateQueries({ queryKey: ["pto-checklist-by-project"] });
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground p-3">Загрузка…</p>;
  if (!data || data.length === 0)
    return (
      <div className="bg-card rounded-xl border p-5">
        <h2 className="font-semibold text-sm mb-2">Чек-лист исполнительной документации</h2>
        <p className="text-sm text-muted-foreground">Чек-лист ИД не загружен для этого объекта.</p>
      </div>
    );

  const done = data.filter((i) => i.done).length;
  const pct = Math.round((done / data.length) * 100);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-primary" />
          <h2 className="font-semibold text-sm">Чек-лист исполнительной документации</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{done} / {data.length}</span>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-medium tabular-nums w-10 text-right">{pct}%</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {data.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-md border hover:bg-muted/30">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle.mutate({ id: item.id, done: !item.done })}
              className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="text-muted-foreground mr-1.5">{item.position}.</span>
                {item.label}
              </p>
              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                {item.status && (
                  <span className={`px-1.5 py-0.5 rounded ${item.done ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {item.status}
                  </span>
                )}
                {item.supervisor && (
                  <span className="px-1.5 py-0.5 rounded bg-info/10 text-info">
                    ✓ {item.supervisor}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
