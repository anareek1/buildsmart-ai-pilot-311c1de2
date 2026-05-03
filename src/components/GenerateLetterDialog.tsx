import { useState } from "react";
import { FileDown, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface Props {
  initialBody?: string;
}

export default function GenerateLetterDialog({ initialBody = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState("Министру финансов\nРеспублики Казахстан\n[ФИО Министра]");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(initialBody);
  const [outgoingNumber, setOutgoingNumber] = useState("");
  const [date, setDate] = useState("");
  const [signed, setSigned] = useState(true);
  const [filename, setFilename] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const token = localStorage.getItem("sk_token");
      const res = await fetch("/api/legal/letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          recipient: recipient.split("\n").map((l) => l.trim()).filter(Boolean),
          subject: subject || undefined,
          body,
          outgoingNumber: outgoingNumber || undefined,
          date: date || undefined,
          signed,
          filename: filename || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const m = cd.match(/filename\*=UTF-8''([^;]+)/);
      const name = m ? decodeURIComponent(m[1]) : `${filename || "Письмо"}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (e) {
      alert(`Ошибка: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setBody(initialBody); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition"
        >
          <FileDown size={12} /> Скачать DOCX
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Сгенерировать письмо на бланке СК-KazAlem</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Шапка, реквизиты и (опционально) подпись с печатью добавятся автоматически.
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Исх. №</label>
              <input
                type="text"
                value={outgoingNumber}
                onChange={(e) => setOutgoingNumber(e.target.value)}
                placeholder="например, 142"
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Имя файла</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Письмо в Минфин"
                className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Адресат (каждая строка отдельно)</label>
            <textarea
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Заголовок (опционально)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="О предоставлении доступа к ..."
              className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Текст письма <span className="text-muted-foreground/70">(абзацы — пустой строкой)</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={signed}
              onChange={(e) => setSigned(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            Поставить подпись и печать (Татаев Б.А.)
          </label>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm rounded-md border hover:bg-muted"
          >
            <X size={14} className="inline mr-1" /> Отмена
          </button>
          <button
            type="button"
            disabled={busy || !body.trim() || !recipient.trim()}
            onClick={generate}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Генерация…" : "Скачать DOCX"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
