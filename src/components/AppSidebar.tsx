import { NavLink, useLocation } from "react-router-dom";
import {
  HardHat,
  Building2,
  FileCheck,
  Users,
  FileText,
  BarChart3,
  Calculator,
  Search,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const modules = [
  { path: "/", icon: LayoutDashboard, label: "Главная" },
  { path: "/pto", icon: HardHat, label: "ИИ-ассистент ПТО" },
  { path: "/digital-construction", icon: Building2, label: "Цифровая стройка" },
  { path: "/acts", icon: FileCheck, label: "Автоматизация актов" },
  { path: "/subcontractors", icon: Users, label: "Субподрядчики" },
  { path: "/documentation", icon: FileText, label: "ИИ-документация" },
  { path: "/analytics", icon: BarChart3, label: "Аналитика" },
  { path: "/accounting", icon: Calculator, label: "ИИ-бухгалтер" },
  { path: "/tenders", icon: Search, label: "Поиск тендеров" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col bg-sidebar-bg border-r transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
      style={{ borderColor: "hsl(var(--sidebar-border))" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
        <span className="font-display text-lg font-bold text-primary">BTC</span>
        {!collapsed && (
          <span className="font-display text-sm text-sidebar-fg tracking-wider">Engineering</span>
        )}
      </div>

      {/* Client Badge */}
      {!collapsed && (
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
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
            }
            title={collapsed ? m.label : undefined}
          >
            <m.icon size={20} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{m.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t text-sidebar-fg/50 hover:text-sidebar-fg transition-colors"
        style={{ borderColor: "hsl(var(--sidebar-border))" }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
