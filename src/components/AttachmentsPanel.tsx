import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, FileSpreadsheet, File as FileIcon, Archive, FileType2 } from "lucide-react";
import { api } from "@/lib/api";

interface Attachment {
  id: string;
  filename: string;
  size: number;
  mime: string | null;
  category: string | null;
  uploadedAt: string;
}

const fmtSize = (b: number) =>
  b < 1024 ? `${b} B`
  : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB`
  : `${(b / 1024 / 1024).toFixed(1)} MB`;

function iconFor(mime: string | null) {
  if (!mime) return <FileIcon size={14} />;
  if (mime.includes("pdf")) return <FileType2 size={14} className="text-red-500" />;
  if (mime.includes("sheet") || mime.includes("excel")) return <FileSpreadsheet size={14} className="text-green-600" />;
  if (mime.includes("word") || mime.includes("document")) return <FileText size={14} className="text-blue-600" />;
  if (mime.includes("rar") || mime.includes("zip")) return <Archive size={14} className="text-amber-600" />;
  return <FileIcon size={14} />;
}

export default function AttachmentsPanel({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery<Attachment[]>({
    queryKey: ["attachments", projectId],
    queryFn: () => api.get<Attachment[]>(`/projects/${projectId}/attachments`),
  });

  const grouped = useMemo(() => {
    const out: Record<string, Attachment[]> = {};
    for (const a of data ?? []) {
      const cat = a.category ?? "Прочее";
      out[cat] ??= [];
      out[cat].push(a);
    }
    return out;
  }, [data]);

  if (isLoading) return <p className="text-sm text-muted-foreground p-3">Загрузка…</p>;
  if (!data || data.length === 0)
    return (
      <div className="bg-card rounded-xl border p-5">
        <h2 className="font-semibold text-sm mb-2">Документы объекта</h2>
        <p className="text-sm text-muted-foreground">Файлы не загружены для этого объекта.</p>
      </div>
    );

  const totalSize = data.reduce((s, a) => s + a.size, 0);

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm">Документы объекта</h2>
        <span className="text-xs text-muted-foreground">{data.length} файлов · {fmtSize(totalSize)}</span>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, files]) => (
          <div key={cat}>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1.5">{cat}</h3>
            <div className="space-y-0.5">
              {files.map((a) => (
                <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/30 group">
                  {iconFor(a.mime)}
                  <span className="text-sm flex-1 min-w-0 truncate">{a.filename}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtSize(a.size)}</span>
                  <button
                    type="button"
                    title="Скачать"
                    onClick={() =>
                      api.download(`/projects/attachments/${a.id}/download`).catch((e) => alert(`Ошибка: ${e.message}`))
                    }
                    className="text-muted-foreground hover:text-primary p-1"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
