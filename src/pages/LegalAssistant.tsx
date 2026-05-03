import { useState, useRef, useEffect } from "react";
import { Scale, Send, FileText, Briefcase, AlertTriangle, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { api } from "@/lib/api";

interface ChatMessage { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  { icon: <FileText size={14} />, text: "Составь претензию подрядчику за просрочку поставки битума на 14 дней" },
  { icon: <Briefcase size={14} />, text: "Какие риски включить в анализ договора субподряда?" },
  { icon: <AlertTriangle size={14} />, text: "Что делать, если заказчик не подписывает КС-2 более 30 дней?" },
  { icon: <FileText size={14} />, text: "Подготовь письмо в ГУ ВКО с просьбой о льготном битуме" },
  { icon: <Scale size={14} />, text: "Чек-лист due diligence для нового субподрядчика" },
  { icon: <AlertTriangle size={14} />, text: "Какие основания для расторжения договора подряда по ГК РК?" },
];

export default function LegalAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text?: string) => {
    const content = (text ?? query).trim();
    if (!content) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setQuery("");
    setSending(true);
    try {
      const res = await api.post<{ reply: string }>("/ai/chat", { module: "legal", messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `Ошибка: ${(e as Error).message}. Проверьте OpenAI ключ.` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-юрист"
        description="Корпоративный юрист по строительному праву РК. Договоры, претензии, тендеры, споры."
        icon={<Scale size={22} />}
      />

      <div className="p-4 md:p-8">
        <div className="bg-card rounded-xl border flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto py-6">
                <div className="bg-muted/50 rounded-lg p-5 mb-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Scale size={18} className="text-primary" /> Здравствуйте, я ваш корпоративный юрист
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    10+ лет в строительной отрасли РК. Знаю ГК РК, Закон о госзакупках, Закон о ТОО, налоговое и
                    трудовое право, FIDIC. Помогу с договорами, претензиями, спорами, тендерами.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Чтобы калибровать ответ, в первом обращении укажите: ваша роль (директор/PM/юрист), стадия вопроса
                    (планирование / договор подписан / спор), есть ли документы для анализа.
                  </p>
                </div>
                <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Примеры запросов:</p>
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
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border"
                    }`}
                  >
                    {m.content}
                  </div>
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

          {/* Input */}
          <div className="border-t p-3 md:p-4 flex gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                title="Очистить чат"
                className="px-3 py-2.5 rounded-lg border hover:bg-muted text-muted-foreground"
              >
                <Trash2 size={16} />
              </button>
            )}
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

        <p className="text-xs text-muted-foreground mt-3 text-center">
          ИИ-юрист — помощник, а не замена живому юристу. Для подписей на документах и представительства в суде нужен
          юрист с доверенностью.
        </p>
      </div>
    </div>
  );
}
