import { FileText, Search, Send, BookOpen, FolderOpen } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

const recentDocs = [
  { name: "Ответ на замечание технадзора — ЖК «Астана»", date: "08.04.2026", type: "Письмо" },
  { name: "Пояснительная записка — изменение проектного решения", date: "05.04.2026", type: "Записка" },
  { name: "Запрос на продление сроков — Водопровод", date: "03.04.2026", type: "Запрос" },
  { name: "Сопроводительное к ИД — школа №14", date: "01.04.2026", type: "Письмо" },
];

const normativeDocs = [
  "СНиП РК 5.03-37-2005 — Бетонные и ж/б конструкции",
  "СП РК 2.02-01-2019 — Основания зданий и сооружений",
  "Закон РК «О государственных закупках»",
  "Приказ №245 — Правила формирования КС-2, КС-3",
];

export default function Documentation() {
  const [query, setQuery] = useState("");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="ИИ-помощник по документации"
        description="Поиск, генерация и проверка строительной документации с помощью ИИ"
        icon={<FileText size={22} />}
      />

      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* AI Search */}
        <div className="bg-card rounded-xl border p-4 md:p-6">
          <h2 className="font-semibold mb-4">Интеллектуальный поиск и генерация</h2>
          <div className="bg-muted rounded-lg p-4 mb-4 min-h-[160px] text-sm">
            <p className="text-muted-foreground mb-2">💡 Примеры запросов:</p>
            <ul className="space-y-1 text-muted-foreground text-xs ml-4 list-disc">
              <li>«Найди все письма заказчику по объекту ЖК «Астана» за март»</li>
              <li>«Сгенерируй ответ на замечание по качеству бетона»</li>
              <li>«Какие требования СНиП к защитному слою бетона для фундаментов?»</li>
              <li>«Подготовь сопроводительное письмо к исполнительной документации»</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Задайте вопрос или опишите нужный документ..."
              className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Send size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Documents */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen size={18} className="text-primary" />
              <h2 className="font-semibold">Последние документы</h2>
            </div>
            <div className="space-y-3">
              {recentDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.date}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{doc.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Normative Base */}
          <div className="bg-card rounded-xl border p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-primary" />
              <h2 className="font-semibold">Нормативная база</h2>
            </div>
            <div className="space-y-2">
              {normativeDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                  <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
