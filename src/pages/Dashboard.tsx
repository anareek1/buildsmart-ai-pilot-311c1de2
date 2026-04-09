import { useNavigate } from "react-router-dom";
import {
  HardHat, Building2, FileCheck, Users, FileText,
  BarChart3, Calculator, Search, TrendingUp, AlertTriangle,
  Clock, CheckCircle
} from "lucide-react";
import StatCard from "@/components/StatCard";

const modules = [
  { path: "/pto", icon: HardHat, label: "ИИ-ассистент ПТО", desc: "КС-2, М-29, журналы, графики" },
  { path: "/digital-construction", icon: Building2, label: "Цифровая стройка", desc: "Учёт материалов, объёмов, ИД" },
  { path: "/acts", icon: FileCheck, label: "Автоматизация актов", desc: "КС-2, КС-3, М-29, АОСР" },
  { path: "/subcontractors", icon: Users, label: "Субподрядчики", desc: "Контроль выполнения и оплат" },
  { path: "/documentation", icon: FileText, label: "ИИ-документация", desc: "Поиск, генерация, шаблоны" },
  { path: "/analytics", icon: BarChart3, label: "Аналитика", desc: "Сводки, прогресс, бюджет" },
  { path: "/accounting", icon: Calculator, label: "ИИ-бухгалтер", desc: "Приходы, расходы, налоги" },
  { path: "/tenders", icon: Search, label: "Поиск тендеров", desc: "Мониторинг, фильтрация, подача" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b px-8 py-8">
        <p className="text-xs font-display text-primary tracking-widest uppercase mb-1">Панель управления</p>
        <h1 className="text-2xl font-semibold">ТОО «СК-Казалем»</h1>
        <p className="text-sm text-muted-foreground mt-1">Строительно-дорожная компания • ИИ-автоматизация от BTC Engineering</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Активные объекты" value="4" change="+1 за месяц" changeType="positive" icon={<Building2 size={22} />} />
          <StatCard title="Выполнение плана" value="78%" change="Опережение на 3 дня" changeType="positive" icon={<TrendingUp size={22} />} />
          <StatCard title="Открытые инциденты" value="7" change="2 критических" changeType="negative" icon={<AlertTriangle size={22} />} />
          <StatCard title="Актов в работе" value="12" change="5 на проверке" changeType="neutral" icon={<Clock size={22} />} />
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Модули системы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div
                key={m.path}
                onClick={() => navigate(m.path)}
                className="module-card group"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <m.icon size={24} />
                </div>
                <h3 className="font-medium text-sm">{m.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Последние события</h2>
          <div className="space-y-3">
            {[
              { text: "КС-2 по объекту «Водопровод ПК-12» — черновик готов", time: "15 мин назад", icon: <FileCheck size={16} /> },
              { text: "Субподрядчик «ЭлектроМонтаж» — отставание 12%", time: "1 час назад", icon: <AlertTriangle size={16} className="text-warning" /> },
              { text: "Новый тендер: капремонт школы №14, 45 млн ₸", time: "2 часа назад", icon: <Search size={16} /> },
              { text: "Поступление бетона М300 — 48 м³ на ЖК «Астана»", time: "3 часа назад", icon: <CheckCircle size={16} className="text-success" /> },
              { text: "М-29 автоматически сформирована за март", time: "Вчера", icon: <FileText size={16} /> },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="text-muted-foreground">{event.icon}</div>
                <p className="text-sm flex-1">{event.text}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
