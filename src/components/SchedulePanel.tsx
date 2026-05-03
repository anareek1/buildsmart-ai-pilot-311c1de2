import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { api } from "@/lib/api";

interface Stage {
  id: string;
  position: number;
  name: string;
  unit: string | null;
  volume: number | null;
  startDate: string | null;
  endDate: string | null;
  scheduleNote: string | null;
}

interface Props {
  projectId: string;
}

const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });
const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function monthsBetween(start: Date, end: Date): { y: number; m: number; label: string }[] {
  const out: { y: number; m: number; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    out.push({ y: cur.getFullYear(), m: cur.getMonth(), label: `${MONTHS[cur.getMonth()]} ${String(cur.getFullYear()).slice(2)}` });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

export default function SchedulePanel({ projectId }: Props) {
  const { data, isLoading, error } = useQuery<Stage[]>({
    queryKey: ["schedule", projectId],
    queryFn: () => api.get<Stage[]>(`/projects/${projectId}/schedule`),
  });

  const { months, range } = useMemo(() => {
    if (!data || data.length === 0) return { months: [], range: null };
    const dates = data
      .flatMap((s) => [s.startDate, s.endDate])
      .filter((d): d is string => !!d)
      .map((d) => new Date(d));
    if (dates.length === 0) return { months: [], range: null };
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return { months: monthsBetween(min, max), range: { min, max } };
  }, [data]);

  if (isLoading) return <p className="text-sm text-muted-foreground p-3">Загрузка ГПР…</p>;
  if (error) return <p className="text-sm text-destructive p-3">Ошибка загрузки графика</p>;
  if (!data || data.length === 0)
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30">
        График производства работ не загружен для этого объекта.
      </div>
    );

  // Compute pixel position
  const totalMs = range ? range.max.getTime() - range.min.getTime() : 1;
  const pct = (date: string | null) => {
    if (!date || !range) return 0;
    return ((new Date(date).getTime() - range.min.getTime()) / totalMs) * 100;
  };

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <h2 className="font-semibold text-sm">График производства работ (ГПР)</h2>
        </div>
        <span className="text-xs text-muted-foreground">{data.length} этапов</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Месяцы (header) */}
          <div className="flex border-b sticky top-0 bg-card z-10">
            <div className="w-[280px] flex-shrink-0 px-2 py-2 text-xs font-medium text-muted-foreground">Этап</div>
            <div className="w-[80px] flex-shrink-0 px-2 py-2 text-xs font-medium text-muted-foreground text-right">Объём</div>
            <div className="flex-1 relative h-8 flex">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 border-l text-[10px] text-center text-muted-foreground py-2"
                  style={{ borderColor: "hsl(var(--border))" }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Строки этапов */}
          {data.map((s) => {
            const left = pct(s.startDate);
            const right = pct(s.endDate);
            const width = Math.max(right - left, 1);
            return (
              <div key={s.id} className="flex border-b last:border-0 hover:bg-muted/20 group">
                <div className="w-[280px] flex-shrink-0 px-2 py-2 text-xs">
                  <div className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">{s.position}.</span>
                    <span className="leading-tight">{s.name}</span>
                  </div>
                  {s.scheduleNote && (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">{s.scheduleNote}</p>
                  )}
                </div>
                <div className="w-[80px] flex-shrink-0 px-2 py-2 text-xs text-right text-muted-foreground">
                  {s.volume != null && (
                    <span>
                      <span className="font-medium tabular-nums text-foreground">{fmt.format(s.volume)}</span>
                      {s.unit && <span className="ml-1">{s.unit}</span>}
                    </span>
                  )}
                </div>
                <div className="flex-1 relative h-12 flex">
                  {/* Сетка по месяцам */}
                  {months.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-l"
                      style={{ borderColor: "hsl(var(--border))" }}
                    />
                  ))}
                  {/* Полоса этапа */}
                  {s.startDate && s.endDate && (
                    <div
                      className="absolute top-3 bottom-3 rounded bg-primary/70 group-hover:bg-primary transition"
                      style={{ left: `${left}%`, width: `${width}%`, minWidth: 4 }}
                      title={`${new Date(s.startDate).toLocaleDateString("ru-RU")} — ${new Date(s.endDate).toLocaleDateString("ru-RU")}`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        Извлечено из PDF графика производства работ. Даты по декадам (1-10 / 11-20 / 21-31).
      </p>
    </div>
  );
}
