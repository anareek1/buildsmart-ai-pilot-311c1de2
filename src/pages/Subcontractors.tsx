import { Users, AlertTriangle, CheckCircle, Banknote } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

const subs = [
  { name: "ТОО «МонолитСтрой»", works: "Монолитные работы", completion: 72, paid: 85, contract: "18 500 000 ₸", status: "warning" },
  { name: "ИП Сериков — Электрика", works: "Электромонтаж", completion: 35, paid: 60, contract: "4 200 000 ₸", status: "danger" },
  { name: "ТОО «АкваИнжиниринг»", works: "Водоснабжение", completion: 90, paid: 88, contract: "12 800 000 ₸", status: "ok" },
  { name: "ТОО «КазДорСтрой»", works: "Дорожное покрытие", completion: 45, paid: 40, contract: "22 000 000 ₸", status: "ok" },
  { name: "ИП Ахметов", works: "Отделочные работы", completion: 15, paid: 20, contract: "6 500 000 ₸", status: "ok" },
];

export default function Subcontractors() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Координация субподрядчиков"
        description="Контроль выполнения, сверка объёмов и управление оплатами"
        icon={<Users size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Субподрядчики" value="5" icon={<Users size={20} />} />
          <StatCard title="Общая сумма договоров" value="64 млн ₸" icon={<Banknote size={20} />} />
          <StatCard title="Среднее выполнение" value="51%" icon={<CheckCircle size={20} />} />
          <StatCard title="Риски" value="1" change="Оплата > выполнения" changeType="negative" icon={<AlertTriangle size={20} />} />
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold">Реестр субподрядчиков</h2>
          </div>
          <div className="divide-y">
            {subs.map((sub, i) => (
              <div key={i} className="p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{sub.name}</h3>
                    <p className="text-xs text-muted-foreground">{sub.works}</p>
                  </div>
                  <span className="text-sm font-medium">{sub.contract}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Выполнение</span>
                      <span className="font-medium">{sub.completion}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${sub.completion}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Оплачено</span>
                      <span className={`font-medium ${sub.status === "danger" ? "text-destructive" : ""}`}>
                        {sub.paid}%
                        {sub.status === "danger" && " ⚠"}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${sub.status === "danger" ? "bg-destructive" : "bg-success"}`} style={{ width: `${sub.paid}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
