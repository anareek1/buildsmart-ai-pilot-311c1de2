import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Material {
  id: string;
  code: string;
  name: string;
  category: string | null;
  unit: string;
  stockQty: number;
  stockValue: number;
  unitPrice: number;
  norm: string | null;
  purpose: string | null;
}

interface Summary {
  totalItems: number;
  inStock: number;
  totalValue: number;
}

interface CategoryRow {
  category: string;
  count: number;
}

type SortKey = "code" | "name" | "category" | "stockQty" | "unit" | "unitPrice" | "stockValue";
type SortDir = "asc" | "desc";

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

function compareBy(a: Material, b: Material, key: SortKey, dir: SortDir): number {
  const av = a[key];
  const bv = b[key];
  let cmp: number;
  if (typeof av === "number" && typeof bv === "number") {
    cmp = av - bv;
  } else {
    cmp = String(av ?? "").localeCompare(String(bv ?? ""), "ru");
  }
  return dir === "asc" ? cmp : -cmp;
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  align?: "left" | "right";
  onSort: (key: SortKey) => void;
}

function SortHeader({ label, sortKey, current, dir, align = "left", onSort }: SortHeaderProps) {
  const active = current === sortKey;
  return (
    <th className={`pb-2 font-medium text-${align}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

export default function Materials() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: summary } = useQuery<Summary>({
    queryKey: ["materials-summary"],
    queryFn: () => api.get<Summary>("/materials/summary"),
  });

  const { data: categories } = useQuery<CategoryRow[]>({
    queryKey: ["materials-categories"],
    queryFn: () => api.get<CategoryRow[]>("/materials/categories"),
  });

  const { data: materials, isLoading, error } = useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: () => api.get<Material[]>("/materials"),
  });

  const filtered = useMemo(() => {
    if (!materials) return [];
    const q = search.trim().toLowerCase();
    let list = materials;
    if (category !== "all") {
      list = list.filter((m) => (m.category ?? "Прочее") === category);
    }
    if (q) {
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.code.includes(q),
      );
    }
    return [...list].sort((a, b) => compareBy(a, b, sortKey, sortDir));
  }, [materials, search, category, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Материалы и склад"
        description="Складские остатки, нормы расхода, движение материалов"
        icon={<Package size={22} />}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Позиций номенклатуры"
            value={summary ? String(summary.totalItems) : "—"}
            icon={<Package size={20} />}
          />
          <StatCard
            title="В наличии"
            value={summary ? String(summary.inStock) : "—"}
            icon={<Package size={20} />}
          />
          <StatCard
            title="Стоимость остатков"
            value={summary ? fmtMoney.format(summary.totalValue) : "—"}
            icon={<Package size={20} />}
          />
        </div>

        <div className="bg-card rounded-xl border p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="font-semibold">Складские остатки</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Все категории</option>
                {categories?.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category} ({c.count})
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Поиск по названию или коду..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground">Загрузка…</p>}
          {error && (
            <p className="text-sm text-destructive">
              Ошибка: {error instanceof Error ? error.message : "неизвестная"}
            </p>
          )}

          {materials && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <SortHeader label="Код" sortKey="code" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Наименование" sortKey="name" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Категория" sortKey="category" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Остаток" sortKey="stockQty" current={sortKey} dir={sortDir} align="right" onSort={toggleSort} />
                    <SortHeader label="Ед." sortKey="unit" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Цена" sortKey="unitPrice" current={sortKey} dir={sortDir} align="right" onSort={toggleSort} />
                    <SortHeader label="Сумма" sortKey="stockValue" current={sortKey} dir={sortDir} align="right" onSort={toggleSort} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 text-xs text-muted-foreground">{m.code}</td>
                      <td className="py-2 pr-3">{m.name}</td>
                      <td className="py-2">
                        {m.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {m.category}
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right tabular-nums">{fmt.format(m.stockQty)}</td>
                      <td className="py-2 text-xs text-muted-foreground">{m.unit}</td>
                      <td className="py-2 text-right tabular-nums text-xs">{fmt.format(m.unitPrice)} ₸</td>
                      <td className="py-2 text-right tabular-nums font-medium">{fmtMoney.format(m.stockValue)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                        Ничего не найдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Показано {filtered.length} из {materials?.length ?? 0}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
