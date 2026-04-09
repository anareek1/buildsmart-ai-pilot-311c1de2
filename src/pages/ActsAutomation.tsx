import { FileCheck, FileSpreadsheet, Download, Eye, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const acts = [
  { type: "КС-2", object: "ЖК «Астана», секция 3", period: "Март 2026", amount: "12 450 000 ₸", status: "Черновик" },
  { type: "КС-3", object: "ЖК «Астана»", period: "Накопительный", amount: "89 200 000 ₸", status: "На проверке" },
  { type: "М-29", object: "Водопровод ПК-12", period: "Март 2026", amount: "—", status: "Готово" },
  { type: "КС-2", object: "Дорога А-351, уч. 2", period: "Март 2026", amount: "8 700 000 ₸", status: "Отправлен" },
  { type: "АОСР", object: "Школа №14, фундамент", period: "22.03.2026", amount: "—", status: "Ожидает подпись" },
];

const statusStyles: Record<string, string> = {
  "Черновик": "bg-muted text-muted-foreground",
  "На проверке": "bg-warning/10 text-warning",
  "Готово": "bg-success/10 text-success",
  "Отправлен": "bg-info/10 text-info",
  "Ожидает подпись": "bg-primary/10 text-primary",
};

export default function ActsAutomation() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Автоматизация актов"
        description="Автоматическая генерация КС-2, КС-3, М-29, АОСР на основе данных объектов"
        icon={<FileCheck size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Всего актов" value="23" icon={<FileSpreadsheet size={20} />} />
          <StatCard title="Готовы к отправке" value="5" icon={<FileCheck size={20} />} />
          <StatCard title="На проверке" value="4" icon={<Eye size={20} />} />
          <StatCard title="Просрочены" value="1" change="КС-2, школа №14" changeType="negative" icon={<Clock size={20} />} />
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold">Реестр актов — Март 2026</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Тип</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Объект</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Период</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">Сумма</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Статус</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {acts.map((act, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-primary">{act.type}</td>
                    <td className="px-6 py-3">{act.object}</td>
                    <td className="px-6 py-3 text-muted-foreground">{act.period}</td>
                    <td className="px-6 py-3 text-right font-medium">{act.amount}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyles[act.status] || ""}`}>
                        {act.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button className="text-muted-foreground hover:text-primary transition-colors">
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
