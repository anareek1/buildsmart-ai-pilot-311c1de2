import { HardHat, FileSpreadsheet, ClipboardCheck, BookOpen, CalendarCheck, Send } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useState } from "react";
import { api } from "@/lib/api";

interface PTOStats {
  docsInProgress: number;
  totalDocs: number;
  idReadiness: number;
  remainingDocs: number;
}

interface Document {
  id: string;
  name: string;
  status: string;
  type: string;
  project: { name: string };
}

interface ChecklistItem {
  id: string;
  projectId: string | null;
  position: number;
  label: string;
  done: boolean;
  status: string | null;
  supervisor: string | null;
  groupName: string;
}

interface ProjectGroup {
  projectId: string | null;
  projectName: string;
  items: ChecklistItem[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Черновик", color: "text-muted-foreground" },
  IN_REVIEW: { label: "На проверке", color: "text-warning" },
  AWAITING_SIGNATURE: { label: "Ожидает подпись", color: "text-info" },
  DONE: { label: "Готово", color: "text-success" },
};

export default function PTOAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();

  const { data: stats } = useQuery<PTOStats>({ queryKey: ["pto-stats"], queryFn: () => api.get("/pto/stats") });
  const { data: docs } = useQuery<Document[]>({ queryKey: ["pto-docs"], queryFn: () => api.get("/pto/documents") });
  const { data: groups } = useQuery<ProjectGroup[]>({
    queryKey: ["pto-checklist-by-project"],
    queryFn: () => api.get("/pto/checklist/by-project"),
  });

  const toggleItem = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      api.patch(`/pto/checklist/${id}`, { done }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pto-checklist-by-project"] }),
  });

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setQuery("");
    setSending(true);
    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { module: "pto", messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Ошибка. Попробуйте ещё раз." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-ассистент ПТО"
        description="Автоматизация документарных функций производственно-технического отдела"
        icon={<HardHat size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Документов в работе" value={stats ? String(stats.docsInProgress) : "—"} icon={<FileSpreadsheet size={20} />} />
          <StatCard title="ИД готовность" value={stats ? `${stats.idReadiness}%` : "—"} change={stats ? `Осталось ${stats.remainingDocs} документов` : undefined} changeType="neutral" icon={<ClipboardCheck size={20} />} />
          <StatCard title="Отклонение М-29" value="8%" change="В пределах нормы" changeType="positive" icon={<BookOpen size={20} />} />
          <StatCard title="Отставание графика" value="2 дня" change="Секция 3, кладка" changeType="negative" icon={<CalendarCheck size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* AI Chat */}
          <div className="bg-card rounded-xl border p-4 md:p-6 flex flex-col">
            <h2 className="font-semibold mb-4">ИИ-помощник ПТО</h2>
            <div className="bg-muted rounded-lg p-4 mb-4 min-h-[200px] text-sm overflow-y-auto flex-1 space-y-3">
              {messages.length === 0 ? (
                <div className="text-muted-foreground">
                  <p className="mb-3">Здравствуйте! Я ваш ИИ-ассистент ПТО. Могу помочь с:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Формированием КС-2 и КС-3</li>
                    <li>Подготовкой М-29</li>
                    <li>Проверкой исполнительной документации</li>
                    <li>Контролем графика работ</li>
                  </ul>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-lg bg-background border text-sm text-muted-foreground">Думаю...</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Введите запрос..."
                className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={sendMessage} disabled={sending} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-4">Документы в работе</h2>
            <div className="space-y-3">
              {(docs ?? []).map((doc) => {
                const s = statusLabel[doc.status] ?? { label: doc.status, color: "text-muted-foreground" };
                return (
                  <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-b last:border-0">
                    <span className="text-sm">{doc.name}</span>
                    <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ID Checklist по объектам */}
        <div className="space-y-4">
          {(groups ?? []).map((g) => {
            const done = g.items.filter((i) => i.done).length;
            const total = g.items.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={g.projectId ?? "_none"} className="bg-card rounded-xl border p-4 md:p-6">
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-sm">Чек-лист ИД</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.projectName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{done} / {total}</span>
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium tabular-nums w-10 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {g.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-md border hover:bg-muted/30">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleItem.mutate({ id: item.id, done: !item.done })}
                        className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.done ? "text-foreground" : ""}`}>
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
          })}
        </div>
      </div>
    </div>
  );
}
