import { HardHat, FileSpreadsheet, ClipboardCheck, BookOpen, CalendarCheck, Send } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useState } from "react";

const documents = [
  { name: "КС-2 — ЖК «Астана», секция 3", status: "На проверке", statusColor: "text-warning" },
  { name: "М-29 — Водопровод ПК-12, март", status: "Готово", statusColor: "text-success" },
  { name: "КС-3 — Дорога Алматы-Капчагай", status: "Черновик", statusColor: "text-muted-foreground" },
  { name: "АОСР — Фундамент, школа №14", status: "Ожидает подпись", statusColor: "text-info" },
];

const checklistItems = [
  { label: "Журнал производства работ", done: true },
  { label: "АОСР армирование", done: true },
  { label: "АОСР бетонирование", done: false },
  { label: "Протокол испытания бетона", done: false },
  { label: "Исполнительная схема", done: true },
];

export default function PTOAssistant() {
  const [query, setQuery] = useState("");

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
          <StatCard title="Документов в работе" value="12" icon={<FileSpreadsheet size={20} />} />
          <StatCard title="ИД готовность" value="67%" change="Осталось 14 документов" changeType="neutral" icon={<ClipboardCheck size={20} />} />
          <StatCard title="Отклонение М-29" value="8%" change="В пределах нормы" changeType="positive" icon={<BookOpen size={20} />} />
          <StatCard title="Отставание графика" value="2 дня" change="Секция 3, кладка" changeType="negative" icon={<CalendarCheck size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* AI Chat */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-4">ИИ-помощник ПТО</h2>
            <div className="bg-muted rounded-lg p-4 mb-4 min-h-[200px] text-sm text-muted-foreground">
              <p className="mb-3">👋 Здравствуйте! Я ваш ИИ-ассистент ПТО. Могу помочь с:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Формированием КС-2 и КС-3</li>
                <li>Подготовкой М-29</li>
                <li>Проверкой исполнительной документации</li>
                <li>Контролем графика работ</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите запрос..."
                className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <h2 className="font-semibold mb-4">Документы в работе</h2>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-b last:border-0">
                  <span className="text-sm">{doc.name}</span>
                  <span className={`text-xs font-medium ${doc.statusColor}`}>{doc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ID Checklist */}
        <div className="bg-card rounded-xl border p-4 md:p-6">
          <h2 className="font-semibold mb-4">Чек-лист ИД — Фундамент, ЖК «Астана»</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {checklistItems.map((item, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                <input type="checkbox" checked={item.done} readOnly className="w-4 h-4 rounded accent-primary" />
                <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
