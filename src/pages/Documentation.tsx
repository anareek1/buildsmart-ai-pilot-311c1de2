import { FileText, Send, BookOpen, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";
import { api } from "@/lib/api";

interface Doc {
  id: string;
  name: string;
  type: string;
  status: string;
  updatedAt: string;
  project: { name: string; type: string };
}

interface ChatMessage { role: "user" | "assistant"; content: string }

interface Standard {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface StandardsResponse {
  total: number;
  items: Standard[];
  grouped: { category: string; items: Standard[] }[];
}

const TYPE_LABELS: Record<string, string> = {
  KS2: "КС-2", KS3: "КС-3", M29: "М-29", AOSR: "АОСР", OTHER: "Другое",
};

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()}`;
}

export default function Documentation() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const { data: docs } = useQuery<Doc[]>({
    queryKey: ["documentation"],
    queryFn: () => api.get("/documentation"),
  });
  const { data: standards } = useQuery<StandardsResponse>({
    queryKey: ["standards"],
    queryFn: () => api.get("/documentation/standards"),
  });

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setQuery("");
    setSending(true);
    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { module: "documentation", messages: next });
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
        title="ИИ-помощник по документации"
        description="Поиск, генерация и проверка строительной документации с помощью ИИ"
        icon={<FileText size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* AI Search */}
        <div className="bg-card rounded-xl border p-4 md:p-6 flex flex-col">
          <h2 className="font-semibold mb-4">Интеллектуальный поиск и генерация</h2>
          <div className="bg-muted rounded-lg p-4 mb-4 min-h-[160px] overflow-y-auto space-y-2 text-sm">
            {messages.length === 0 ? (
              <>
                <p className="text-muted-foreground mb-2">Примеры запросов:</p>
                <ul className="space-y-1 text-muted-foreground text-xs ml-4 list-disc">
                  <li>«Сгенерируй ответ на замечание по качеству бетона»</li>
                  <li>«Какие требования СНиП к защитному слою бетона для фундаментов?»</li>
                  <li>«Подготовь сопроводительное письмо к исполнительной документации»</li>
                </ul>
              </>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {sending && <div className="flex justify-start"><div className="px-3 py-2 rounded-lg bg-background border text-sm text-muted-foreground">Думаю...</div></div>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Задайте вопрос или опишите нужный документ..."
              className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={sendMessage} disabled={sending} className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Documents from DB */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen size={18} className="text-primary" />
              <h2 className="font-semibold">Последние документы</h2>
            </div>
            <div className="space-y-3">
              {(docs ?? []).slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.project?.name} · {fmtDate(doc.updatedAt)}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded ml-2 flex-shrink-0">{TYPE_LABELS[doc.type] ?? doc.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Normative Base */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <h2 className="font-semibold">Нормативная база</h2>
              </div>
              {standards && (
                <span className="text-xs text-muted-foreground">{standards.total} нормативных актов</span>
              )}
            </div>
            <div className="space-y-4 max-h-[420px] overflow-y-auto">
              {(standards?.grouped ?? []).map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">{group.category}</h3>
                  <div className="space-y-1">
                    {group.items.map((s) => (
                      <div key={s.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/30">
                        <FileText size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium font-mono">{s.code}</p>
                          <p className="text-xs text-muted-foreground">{s.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
