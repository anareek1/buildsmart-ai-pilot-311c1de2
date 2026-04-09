import { Building2, Package, TrendingDown, Layers, AlertTriangle, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const materials = [
  { name: "Бетон М300", stock: "48 м³", norm: "На 3 дня", status: "ok" },
  { name: "Арматура Ø12", stock: "2.4 т", norm: "На 5 дней", status: "ok" },
  { name: "Трубы ПЭ-100 Ø315", stock: "120 п.м.", norm: "На 1 день", status: "low" },
  { name: "Кирпич М150", stock: "8 000 шт", norm: "На 4 дня", status: "ok" },
  { name: "ЩПС фр. 0-40", stock: "85 м³", norm: "На 2 дня", status: "warning" },
];

const dailyWorks = [
  { object: "ЖК «Астана»", work: "Кладка 3 этаж, секция 2", volume: "45 м²" },
  { object: "Водопровод ПК-12", work: "Прокладка трубы Ø315", volume: "250 п.м." },
  { object: "Дорога А-351", work: "Укладка ЩПС", volume: "3 000 м²" },
];

const incidents = [
  { desc: "Перерасход труб ПЭ-100 на 18%", category: "Снабжение", severity: "high" },
  { desc: "Трещина в стене, секция 1, 2 этаж", category: "Качество", severity: "high" },
  { desc: "Задержка поставки арматуры", category: "Снабжение", severity: "medium" },
];

export default function DigitalConstruction() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Цифровая стройка"
        description="Операционное управление объектами — материалы, объёмы, ИД, инциденты"
        icon={<Building2 size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Активные объекты" value="4" icon={<Building2 size={20} />} />
          <StatCard title="Позиции материалов" value="47" change="3 с низким остатком" changeType="negative" icon={<Package size={20} />} />
          <StatCard title="Отклонение расхода" value="8%" change="В пределах допуска" changeType="positive" icon={<TrendingDown size={20} />} />
          <StatCard title="Инциденты (откр.)" value="3" change="2 критических" changeType="negative" icon={<AlertTriangle size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materials */}
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Остатки материалов</h2>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={14} /> Приход
              </button>
            </div>
            <div className="space-y-2">
              {materials.map((m, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${m.status === "low" ? "border-destructive/40 bg-destructive/5" : m.status === "warning" ? "border-warning/40 bg-warning/5" : ""}`}>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.norm}</p>
                  </div>
                  <span className="text-sm font-medium">{m.stock}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily volumes */}
          <div className="bg-card rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Выполнение за сегодня</h2>
            <div className="space-y-3">
              {dailyWorks.map((w, i) => (
                <div key={i} className="p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-primary font-medium">{w.object}</p>
                      <p className="text-sm mt-0.5">{w.work}</p>
                    </div>
                    <span className="text-sm font-semibold bg-muted px-2 py-1 rounded">{w.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Открытые инциденты</h2>
          <div className="space-y-2">
            {incidents.map((inc, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${inc.severity === "high" ? "border-destructive/40" : "border-warning/40"}`}>
                <AlertTriangle size={16} className={inc.severity === "high" ? "text-destructive" : "text-warning"} />
                <div className="flex-1">
                  <p className="text-sm">{inc.desc}</p>
                  <p className="text-xs text-muted-foreground">{inc.category}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${inc.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                  {inc.severity === "high" ? "Критический" : "Средний"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
