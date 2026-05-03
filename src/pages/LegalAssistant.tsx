import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Scale, Send, FileText, Briefcase, AlertTriangle, Trash2, Plus, MessageSquare, Download, Pencil, Check, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GenerateLetterDialog from "@/components/GenerateLetterDialog";
import { api } from "@/lib/api";

interface Message { id?: string; role: "user" | "assistant"; content: string }

interface SessionPreview {
  id: string; title: string; updatedAt: string;
  _count: { messages: number; documents: number };
}

interface LegalDocumentRow {
  id: string; filename: string; size: number; recipient: string | null;
  subject: string | null; signed: boolean; createdAt: string;
}

interface SessionDetail {
  id: string; title: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
  documents: LegalDocumentRow[];
}

const QUICK_PROMPTS = [
  { icon: <FileText size={14} />, text: "Составь претензию подрядчику за просрочку поставки битума на 14 дней" },
  { icon: <Briefcase size={14} />, text: "Какие риски включить в анализ договора субподряда?" },
  { icon: <AlertTriangle size={14} />, text: "Что делать, если заказчик не подписывает КС-2 более 30 дней?" },
  { icon: <FileText size={14} />, text: "Подготовь письмо в ГУ ВКО с просьбой о льготном битуме" },
  { icon: <Scale size={14} />, text: "Чек-лист due diligence для нового субподрядчика" },
  { icon: <AlertTriangle size={14} />, text: "Какие основания для расторжения договора подряда по ГК РК?" },
];

function fmtDate(d: string) {
  const dt = new Date(d);
  const now = new Date();
  const sameDay = dt.toDateString() === now.toDateString();
  if (sameDay) return dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

function fmtSize(b: number) {
  return b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function LegalAssistant() {
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useQuery<SessionPreview[]>({
    queryKey: ["legal-sessions"],
    queryFn: () => api.get<SessionPreview[]>("/legal/sessions"),
  });

  const { data: activeSession } = useQuery<SessionDetail>({
    queryKey: ["legal-session", sessionId],
    queryFn: () => api.get<SessionDetail>(`/legal/sessions/${sessionId}`),
    enabled: !!sessionId,
  });

  const messages: Message[] = useMemo(() => {
    if (activeSession) {
      return activeSession.messages.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }));
    }
    return draftMessages;
  }, [activeSession, draftMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const createSession = useMutation({
    mutationFn: () => api.post<{ id: string }>("/legal/sessions", { title: "Новый чат" }),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["legal-sessions"] });
      setSessionId(s.id);
      setDraftMessages([]);
    },
  });

  const renameSession = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.patch(`/legal/sessions/${id}`, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["legal-sessions"] });
      setRenaming(null);
    },
  });

  const deleteSession = useMutation({
    mutationFn: (id: string) => api.delete(`/legal/sessions/${id}`),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ["legal-sessions"] });
      if (sessionId === id) setSessionId(null);
    },
  });

  const send = async (text?: string) => {
    const content = (text ?? query).trim();
    if (!content) return;
    setQuery("");
    setSending(true);

    // Ensure session exists
    let sid = sessionId;
    if (!sid) {
      const s = await api.post<{ id: string }>("/legal/sessions", { title: content.slice(0, 80) });
      sid = s.id;
      setSessionId(sid);
      qc.invalidateQueries({ queryKey: ["legal-sessions"] });
    }

    // Optimistic UI
    const optimistic: Message[] = [...messages, { role: "user", content }];
    qc.setQueryData<SessionDetail | undefined>(["legal-session", sid], (prev) =>
      prev
        ? { ...prev, messages: [...prev.messages, { id: "tmp-u", role: "user", content, createdAt: new Date().toISOString() }] }
        : prev,
    );

    try {
      // 1. save user message
      await api.post(`/legal/sessions/${sid}/messages`, { role: "user", content });
      // 2. ask AI
      const res = await api.post<{ reply: string }>("/ai/chat", { module: "legal", messages: optimistic });
      // 3. save assistant message
      await api.post(`/legal/sessions/${sid}/messages`, { role: "assistant", content: res.reply });
      // 4. refresh
      qc.invalidateQueries({ queryKey: ["legal-session", sid] });
      qc.invalidateQueries({ queryKey: ["legal-sessions"] });
    } catch (e) {
      qc.setQueryData<SessionDetail | undefined>(["legal-session", sid], (prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, { id: "tmp-e", role: "assistant", content: `Ошибка: ${(e as Error).message}`, createdAt: new Date().toISOString() }] }
          : prev,
      );
    } finally {
      setSending(false);
    }
  };

  const startRename = (s: SessionPreview) => {
    setRenaming(s.id);
    setRenameDraft(s.title);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-юрист"
        description="Корпоративный юрист по строительному праву РК. История чатов и документов сохраняется."
        icon={<Scale size={22} />}
      />

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4" style={{ height: "calc(100vh - 220px)" }}>
          {/* === SIDEBAR: sessions === */}
          <div className="bg-card rounded-xl border flex flex-col overflow-hidden">
            <div className="p-3 border-b">
              <button
                type="button"
                onClick={() => createSession.mutate()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
              >
                <Plus size={14} /> Новый чат
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {(sessions ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground p-3 text-center">История пустая</p>
              )}
              {(sessions ?? []).map((s) => {
                const active = sessionId === s.id;
                const isRenaming = renaming === s.id;
                return (
                  <div
                    key={s.id}
                    className={`rounded-md p-2 text-sm cursor-pointer transition ${
                      active ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50 border border-transparent"
                    }`}
                    onClick={() => !isRenaming && setSessionId(s.id)}
                  >
                    {isRenaming ? (
                      <div className="flex gap-1">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") renameSession.mutate({ id: s.id, title: renameDraft });
                            if (e.key === "Escape") setRenaming(null);
                          }}
                          className="flex-1 px-2 py-0.5 text-xs rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={(e) => { e.stopPropagation(); renameSession.mutate({ id: s.id, title: renameDraft }); }} className="text-success hover:bg-success/10 p-0.5 rounded">
                          <Check size={12} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setRenaming(null); }} className="text-muted-foreground hover:bg-muted p-0.5 rounded">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-1.5">
                          <MessageSquare size={12} className="mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <p className="text-xs font-medium leading-snug flex-1 line-clamp-2">{s.title}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                          <span>{fmtDate(s.updatedAt)} · {s._count.messages} сообщ.{s._count.documents > 0 && ` · ${s._count.documents} док.`}</span>
                          <div className="flex gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); startRename(s); }}
                              className="hover:text-foreground p-0.5"
                              title="Переименовать"
                            >
                              <Pencil size={10} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Удалить чат «${s.title}»?`)) deleteSession.mutate(s.id);
                              }}
                              className="hover:text-destructive p-0.5"
                              title="Удалить"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* === MAIN: chat + documents === */}
          <div className="flex flex-col gap-3 min-w-0">
            {/* Documents bar (если есть) */}
            {activeSession && activeSession.documents.length > 0 && (
              <div className="bg-card rounded-xl border p-3">
                <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Документы этого чата ({activeSession.documents.length})</p>
                <div className="flex flex-wrap gap-2">
                  {activeSession.documents.map((d) => (
                    <button
                      key={d.id}
                      onClick={() =>
                        api.download(`/legal/documents/${d.id}/download`).catch((e) => alert(`Ошибка: ${e.message}`))
                      }
                      title={`${d.recipient ?? ""} · ${fmtDate(d.createdAt)} · ${fmtSize(d.size)}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border hover:border-primary/40 hover:bg-muted/50"
                    >
                      <FileText size={12} className="text-primary" />
                      <span className="max-w-[200px] truncate">{d.filename}</span>
                      <Download size={11} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            <div className="bg-card rounded-xl border flex flex-col flex-1 overflow-hidden">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="max-w-2xl mx-auto py-6">
                    <div className="bg-muted/50 rounded-lg p-5 mb-5">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Scale size={18} className="text-primary" /> Здравствуйте, я ваш корпоративный юрист
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Помогу с договорами, претензиями, спорами, тендерами. История чатов и сгенерированных DOCX
                        сохраняется — можно вернуться к старому диалогу.
                      </p>
                    </div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Примеры:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {QUICK_PROMPTS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => send(p.text)}
                          className="text-left p-3 rounded-lg border hover:border-primary/40 hover:bg-muted/30 transition flex items-start gap-2 text-sm"
                        >
                          <span className="text-muted-foreground mt-0.5">{p.icon}</span>
                          <span>{p.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${
                          m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border"
                        }`}
                      >
                        {m.content}
                      </div>
                      {m.role === "assistant" && m.content.length > 100 && (
                        <div className="mt-1.5">
                          <GenerateLetterDialog initialBody={m.content} sessionId={sessionId ?? undefined} />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {sending && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-lg bg-muted/50 border text-sm text-muted-foreground">
                      Изучаю нормы…
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-3 md:p-4 flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Спросите о договоре, тендере, споре или попросите составить документ..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={() => send()}
                  disabled={sending || !query.trim()}
                  className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          ИИ-юрист — помощник, а не замена живому юристу. Для подписей и представительства в суде нужен юрист с
          доверенностью.
        </p>
      </div>
    </div>
  );
}
