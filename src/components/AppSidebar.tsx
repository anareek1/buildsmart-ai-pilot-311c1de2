import { NavLink, useLocation } from "react-router-dom";
import {
  HardHat, Building2, FileCheck, Users, FileText,
  BarChart3, Calculator, Search, LayoutDashboard, Package, Scale,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { SKLogoMark, SKWordmark } from "./SKLogo";

const modules = [
  { path: "/app", icon: LayoutDashboard, label: "Главная", end: true },
  { path: "/app/pto", icon: HardHat, label: "ИИ-ассистент ПТО" },
  { path: "/app/digital-construction", icon: Building2, label: "Цифровая стройка" },
  { path: "/app/materials", icon: Package, label: "Материалы и склад" },
  { path: "/app/acts", icon: FileCheck, label: "Автоматизация актов" },
  { path: "/app/subcontractors", icon: Users, label: "Субподрядчики" },
  { path: "/app/documentation", icon: FileText, label: "ИИ-документация" },
  { path: "/app/analytics", icon: BarChart3, label: "Аналитика" },
  { path: "/app/accounting", icon: Calculator, label: "ИИ-бухгалтер" },
  { path: "/app/tenders", icon: Search, label: "Поиск тендеров" },
  { path: "/app/legal", icon: Scale, label: "ИИ-юрист" },
];

interface Props {
  onNavigate?: () => void;
  forceMobile?: boolean;
}

export default function AppSidebar({ onNavigate, forceMobile }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const showFull = forceMobile || !collapsed;

  return (
    <aside
      className={`flex flex-col bg-sidebar-bg border-r transition-all duration-300 ${
        forceMobile ? "w-full h-full" : collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{ borderColor: "hsl(var(--sidebar-border))" }}
    >
      {/* Logo — hidden in mobile sheet (header already shows it) */}
      {!forceMobile && (
        <NavLink
          to="/"
          className="flex items-center px-4 h-16 border-b hover:opacity-80 transition-opacity"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
          title="На главную"
        >
          {showFull ? <SKWordmark size="sm" /> : <SKLogoMark className="h-7 w-7" />}
        </NavLink>
      )}

      {/* Client Badge */}
      {showFull && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg bg-sidebar-hover">
          <p className="text-xs text-sidebar-fg/60">Клиент</p>
          <p className="text-sm font-medium text-sidebar-fg">ТОО «СК-Казалем»</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {modules.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            end={m.path === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${!showFull ? "justify-center px-2" : ""}`
            }
            title={!showFull ? m.label : undefined}
          >
            <m.icon size={20} className="flex-shrink-0" />
            {showFull && <span className="truncate">{m.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!forceMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-12 border-t text-sidebar-fg/50 hover:text-sidebar-fg transition-colors"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}
    </aside>
  );
}
