import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="border-b bg-card px-8 py-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
