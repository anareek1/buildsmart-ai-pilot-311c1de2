import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { api } from "@/lib/api";

interface Material {
  id: string;
  code: string;
  name: string;
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

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

export default function Materials() {
  const [search, setSearch] = useState("");

  const { data: summary } = useQuery<Summary>({
    queryKey: ["materials-summary"],
    queryFn: () => api.get<Summary>("/materials/summary"),
  });

  const { data: materials, isLoading, error } = useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: () => api.get<Material[]>("/materials"),
  });

  const filtered = useMemo(() => {
    if (!materials) return [];
    const q = search.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter(
      (m) => m.name.toLowerCase().includes(q) || m.code.includes(q),
    );
  }, [materials, search]);

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
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="font-semibold">Складские остатки</h2>
            <div className="relative w-full max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск по названию или коду..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
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
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="pb-2 font-medium">Код</th>
                    <th className="pb-2 font-medium">Наименование</th>
                    <th className="pb-2 font-medium text-right">Остаток</th>
                    <th className="pb-2 font-medium">Ед.</th>
                    <th className="pb-2 font-medium text-right">Цена</th>
                    <th className="pb-2 font-medium text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-2 text-xs text-muted-foreground">{m.code}</td>
                      <td className="py-2 pr-3">{m.name}</td>
                      <td className="py-2 text-right tabular-nums">{fmt.format(m.stockQty)}</td>
                      <td className="py-2 text-xs text-muted-foreground">{m.unit}</td>
                      <td className="py-2 text-right tabular-nums text-xs">{fmt.format(m.unitPrice)} ₸</td>
                      <td className="py-2 text-right tabular-nums font-medium">{fmtMoney.format(m.stockValue)}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
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
