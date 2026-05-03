import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { api } from "@/lib/api";

interface ChecklistItem {
  id: string;
  position: number;
  label: string;
  done: boolean;
  status: string | null;
  supervisor: string | null;
}

interface Props {
  projectId: string;
}

export default function ChecklistPanel({ projectId }: Props) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ label: string; status: string; supervisor: string }>({
    label: "", status: "", supervisor: "",
  });
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<{ label: string; status: string }>({ label: "", status: "" });

  const { data, isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["pto-checklist", projectId],
    queryFn: () => api.get<ChecklistItem[]>(`/pto/checklist?projectId=${projectId}`),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["pto-checklist", projectId] });
    qc.invalidateQueries({ queryKey: ["pto-checklist-by-project"] });
  };

  const toggle = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => api.patch(`/pto/checklist/${id}`, { done }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, ...rest }: { id: string; label?: string; status?: string | null; supervisor?: string | null }) =>
      api.patch(`/pto/checklist/${id}`, rest),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  const create = useMutation({
    mutationFn: () => api.post("/pto/checklist", { projectId, ...newDraft }),
    onSuccess: () => { invalidate(); setAdding(false); setNewDraft({ label: "", status: "" }); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/pto/checklist/${id}`),
    onSuccess: invalidate,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground p-3">Загрузка…</p>;

  const items = data ?? [];
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  const startEdit = (it: ChecklistItem) => {
    setEditingId(it.id);
    setDraft({ label: it.label, status: it.status ?? "", supervisor: it.supervisor ?? "" });
  };

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={18} className="text-primary" />
          <h2 className="font-semibold text-sm">Чек-лист исполнительной документации</h2>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">{done} / {items.length}</span>
              <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs font-medium tabular-nums w-10 text-right">{pct}%</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {items.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground py-2">Чек-лист пустой. Добавьте первый пункт.</p>
        )}

        {items.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-md border hover:bg-muted/30">
              <input
                type="checkbox"
                checked={item.done}
                disabled={isEditing}
                onChange={() => toggle.mutate({ id: item.id, done: !item.done })}
                className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      placeholder="Наименование документа"
                      className="w-full px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={draft.status}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                        placeholder="Статус (например: «ведётся», «есть»)"
                        className="px-2 py-1 text-xs rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="text"
                        value={draft.supervisor}
                        onChange={(e) => setDraft({ ...draft, supervisor: e.target.value })}
                        placeholder="Подписан технадзором (пометка)"
                        className="px-2 py-1 text-xs rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <>
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
                        <span className="px-1.5 py-0.5 rounded bg-info/10 text-info">✓ {item.supervisor}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      title="Сохранить"
                      onClick={() => update.mutate({ id: item.id, ...draft })}
                      disabled={update.isPending || !draft.label.trim()}
                      className="text-success hover:bg-success/10 p-1 rounded"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      title="Отмена"
                      onClick={() => setEditingId(null)}
                      className="text-muted-foreground hover:bg-muted p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Редактировать"
                      onClick={() => startEdit(item)}
                      className="text-muted-foreground hover:text-primary p-1 rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      title="Удалить"
                      onClick={() => {
                        if (confirm(`Удалить «${item.label}»?`)) remove.mutate(item.id);
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {adding ? (
          <div className="p-2.5 rounded-md border-2 border-primary/40 space-y-2 bg-primary/5">
            <input
              type="text"
              value={newDraft.label}
              onChange={(e) => setNewDraft({ ...newDraft, label: e.target.value })}
              autoFocus
              placeholder="Наименование документа (например, «Журнал бетонных работ»)"
              className="w-full px-2 py-1.5 text-sm rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={newDraft.status}
              onChange={(e) => setNewDraft({ ...newDraft, status: e.target.value })}
              placeholder="Статус (опционально): ведётся / есть / отсутствует"
              className="w-full px-2 py-1.5 text-xs rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setAdding(false); setNewDraft({ label: "", status: "" }); }}
                className="px-3 py-1 text-xs rounded border hover:bg-muted"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => create.mutate()}
                disabled={!newDraft.label.trim() || create.isPending}
                className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {create.isPending ? "Добавление…" : "Добавить"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 p-2 rounded-md border border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/30"
          >
            <Plus size={14} /> Добавить пункт
          </button>
        )}
      </div>
    </div>
  );
}
