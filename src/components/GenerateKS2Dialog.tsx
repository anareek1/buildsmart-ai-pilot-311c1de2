import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface EstimateItem {
  id: string;
  position: number;
  code: string | null;
  name: string;
  unit: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Act {
  id: string;
  type: string;
  number: string | null;
  projectId: string;
}

interface Props {
  projectId: string;
  projectName: string;
}

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const fmtMoney = new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "KZT", maximumFractionDigits: 0,
});

export default function GenerateKS2Dialog({ projectId, projectName }: Props) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [doneQty, setDoneQty] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: estimate, isLoading } = useQuery<EstimateItem[]>({
    queryKey: ["estimate", projectId],
    queryFn: () => api.get<EstimateItem[]>(`/projects/${projectId}/estimate`),
    enabled: open,
  });

  const { data: existingActs } = useQuery<Act[]>({
    queryKey: ["acts"],
    queryFn: () => api.get<Act[]>("/acts"),
    enabled: open,
  });

  // Suggest next act number
  const suggestedNumber = useMemo(() => {
    if (!existingActs) return "";
    const nums = existingActs
      .filter((a) => a.projectId === projectId && a.type === "KS2" && a.number)
      .map((a) => Number(a.number))
      .filter((n) => !isNaN(n));
    return String((nums.length ? Math.max(...nums) : 0) + 1);
  }, [existingActs, projectId]);

  const totalAmount = useMemo(() => {
    if (!estimate) return 0;
    return estimate.reduce((s, item) => {
      const q = parseFloat(doneQty[item.id] ?? "0") || 0;
      return s + q * item.unitPrice;
    }, 0);
  }, [estimate, doneQty]);

  const filledCount = Object.values(doneQty).filter((v) => parseFloat(v) > 0).length;

  const create = useMutation({
    mutationFn: () =>
      api.post<Act>("/acts", {
        projectId,
        type: "KS2",
        name: `Акт КС-2 №${number || suggestedNumber}`,
        number: number || suggestedNumber,
        amount: totalAmount,
        date,
        status: "DRAFT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acts"] });
      setOpen(false);
      setDoneQty({});
      setNumber("");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setDoneQty({});
          setNumber("");
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/10">
          <FilePlus2 size={12} /> Создать КС-2
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Генерация акта КС-2</DialogTitle>
          <p className="text-xs text-muted-foreground">{projectName}</p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Номер акта</label>
            <input
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={suggestedNumber || "1"}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Дата акта</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-3 border rounded-md overflow-hidden">
          {isLoading && <p className="text-sm text-muted-foreground p-4">Загрузка сметы…</p>}
          {!isLoading && (!estimate || estimate.length === 0) && (
            <p className="text-sm text-muted-foreground p-4">Локальная смета не загружена для этого объекта.</p>
          )}
          {estimate && estimate.length > 0 && (
            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="text-muted-foreground">
                    <th className="px-2 py-2 text-left w-8">№</th>
                    <th className="px-2 py-2 text-left">Шифр</th>
                    <th className="px-2 py-2 text-left">Наименование</th>
                    <th className="px-2 py-2 text-right">По смете</th>
                    <th className="px-2 py-2 text-left">Ед.</th>
                    <th className="px-2 py-2 text-right">Цена</th>
                    <th className="px-2 py-2 text-right w-28">Выполнено</th>
                    <th className="px-2 py-2 text-right">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.map((item) => {
                    const q = parseFloat(doneQty[item.id] ?? "0") || 0;
                    const sum = q * item.unitPrice;
                    return (
                      <tr key={item.id} className="border-t hover:bg-muted/20">
                        <td className="px-2 py-1.5 text-muted-foreground">{item.position}</td>
                        <td className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">{item.code ?? "—"}</td>
                        <td className="px-2 py-1.5 max-w-md truncate" title={item.name}>{item.name}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{fmt.format(item.quantity)}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{item.unit ?? "—"}</td>
                        <td className="px-2 py-1.5 text-right tabular-nums">{fmt.format(item.unitPrice)}</td>
                        <td className="px-2 py-1.5 text-right">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={doneQty[item.id] ?? ""}
                            onChange={(e) => setDoneQty({ ...doneQty, [item.id]: e.target.value })}
                            placeholder="0"
                            className="w-24 px-2 py-1 text-xs text-right rounded border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums font-medium">
                          {sum > 0 ? fmtMoney.format(sum) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Заполнено позиций: <span className="font-medium text-foreground">{filledCount}</span>
          </span>
          <span className="font-semibold">
            Итого: <span className="text-primary">{fmtMoney.format(totalAmount)}</span>
          </span>
        </div>

        {create.isError && (
          <p className="text-sm text-destructive">
            Ошибка: {(create.error as Error)?.message}
          </p>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={totalAmount <= 0 || create.isPending}
            onClick={() => create.mutate()}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {create.isPending ? "Создание…" : "Создать акт"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
