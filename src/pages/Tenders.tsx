import { Search, Radar, Shield, Zap, ExternalLink, Calendar, MapPin, Banknote, Star } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useState } from "react";

const tenders = [
  {
    title: "Капитальный ремонт школы №14",
    customer: "ГУ «Отдел образования г. Астаны»",
    budget: "45 000 000 ₸",
    deadline: "15.04.2026",
    region: "г. Астана",
    match: 92,
    status: "Новый",
    source: "goszakup.gov.kz",
  },
  {
    title: "Реконструкция водопровода по ул. Кенесары",
    customer: "ГКП «Астана Су Арнасы»",
    budget: "78 500 000 ₸",
    deadline: "20.04.2026",
    region: "г. Астана",
    match: 88,
    status: "В работе",
    source: "goszakup.gov.kz",
  },
  {
    title: "Строительство дороги Талгар–Есик, участок 3",
    customer: "КГП «КазАвтоЖол»",
    budget: "120 000 000 ₸",
    deadline: "25.04.2026",
    region: "Алматинская обл.",
    match: 75,
    status: "Новый",
    source: "Самрук-Казына",
  },
  {
    title: "Благоустройство парка в мкр. Жетысу",
    customer: "Акимат Алмалинского района",
    budget: "22 000 000 ₸",
    deadline: "12.04.2026",
    region: "г. Алматы",
    match: 60,
    status: "Пропущен",
    source: "goszakup.gov.kz",
  },
];

const statusStyles: Record<string, string> = {
  "Новый": "bg-success/10 text-success",
  "В работе": "bg-primary/10 text-primary",
  "Подано": "bg-info/10 text-info",
  "Пропущен": "bg-muted text-muted-foreground",
};

export default function Tenders() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Поиск тендеров и объёмов"
        description="Мониторинг goszakup.gov.kz, Самрук-Казына — фильтрация, анализ, подготовка"
        icon={<Search size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Найдено за неделю" value="12" change="4 подходящих" changeType="positive" icon={<Radar size={20} />} />
          <StatCard title="В работе" value="2" icon={<Zap size={20} />} />
          <StatCard title="Подано за месяц" value="5" change="2 победы" changeType="positive" icon={<Shield size={20} />} />
          <StatCard title="Конверсия" value="40%" change="+10% к прошлому мес." changeType="positive" icon={<Star size={20} />} />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["all", "Новый", "В работе", "Подано"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "Все" : f}
            </button>
          ))}
        </div>

        {/* Tender Cards */}
        <div className="space-y-4">
          {tenders
            .filter((t) => filter === "all" || t.status === filter)
            .map((tender, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[tender.status] || ""}`}>
                        {tender.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{tender.source}</span>
                    </div>
                    <h3 className="font-medium">{tender.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{tender.customer}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10">
                    <Star size={14} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">{tender.match}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Banknote size={14} />
                    <span className="font-medium text-foreground">{tender.budget}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar size={14} />
                    <span>до {tender.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={14} />
                    <span>{tender.region}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity">
                    Взять в работу
                  </button>
                  <button className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors flex items-center gap-1">
                    <ExternalLink size={14} /> Открыть
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
