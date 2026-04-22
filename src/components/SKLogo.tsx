const OCHRE = "#C8823C";

export function SKLogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-label="SK-KazAlem">
      <g stroke={OCHRE} strokeWidth="1.2" opacity="0.4" fill="none">
        <circle cx="60" cy="60" r="44" />
        <ellipse cx="60" cy="60" rx="44" ry="18" />
        <ellipse cx="60" cy="60" rx="18" ry="44" />
        <line x1="16" y1="60" x2="104" y2="60" />
      </g>
      <line x1="60" y1="32" x2="60" y2="88" stroke={OCHRE} strokeWidth="1.5" opacity="0.55" />
      <g fill={OCHRE}>
        <rect x="22" y="34" width="20" height="6" />
        <rect x="22" y="34" width="6" height="16" />
        <rect x="22" y="57" width="20" height="6" />
        <rect x="36" y="57" width="6" height="23" />
        <rect x="22" y="74" width="20" height="6" />
      </g>
      <g fill={OCHRE}>
        <rect x="72" y="34" width="6" height="46" />
        <polygon points="78,55 93,34 100,34 85,55" />
        <polygon points="78,59 93,80 100,80 85,59" />
      </g>
    </svg>
  );
}

export function SKWordmark({
  showSubtitle = true,
  className = "",
  size = "md",
}: {
  showSubtitle?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const mainSize = size === "sm" ? 16 : 20;
  const subSize = size === "sm" ? 8 : 9;
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <SKLogoMark className={size === "sm" ? "h-7 w-7 shrink-0" : "h-9 w-9 shrink-0"} />
      <div className="leading-none">
        <div
          className="font-bold uppercase"
          style={{
            fontFamily: "var(--font-oswald)",
            color: "hsl(var(--foreground))",
            letterSpacing: "0.02em",
            fontSize: mainSize,
          }}
        >
          SK<span style={{ color: OCHRE, margin: "0 3px" }}>—</span>KazAlem
        </div>
        {showSubtitle && (
          <div
            className="mt-1 uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: subSize,
              letterSpacing: "0.3em",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            СТРОИТЕЛЬСТВО · ИНФРАСТРУКТУРА
          </div>
        )}
      </div>
    </div>
  );
}
