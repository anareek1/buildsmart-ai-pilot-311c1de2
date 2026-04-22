import { useEffect } from "react";

const ochre = "#C8823C";
const bg = "#1A1512";
const deep = "#0F0C0A";
const surface = "#2B2420";
const bone = "#E8D9C0";
const concrete = "#7A6A58";

const navItems = [
  { label: "О компании", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Проекты", href: "#projects" },
  { label: "Сертификаты", href: "#certs" },
  { label: "Контакты", href: "#contact" },
];

const stats = [
  { n: "17", unit: "ЛЕТ", label: "Опыта на рынке РК" },
  { n: "147", unit: "ОБЪЕКТОВ", label: "Сдано под ключ" },
  { n: "2.8", unit: "МЛН М²", label: "Общая площадь застройки" },
  { n: "840+", unit: "СОТРУД.", label: "В штате и на объектах" },
];

const services = [
  {
    num: "01",
    title: "Промышленные объекты",
    desc: "Заводы, склады, логистические комплексы, энергетические сооружения. Монолит, металлоконструкции, инженерные системы.",
    items: [
      "Цеха и производственные корпуса",
      "Складские терминалы класса А",
      "Подстанции и ТП",
      "Водо- и газоочистные сооружения",
    ],
  },
  {
    num: "02",
    title: "Инфраструктура",
    desc: "Автомобильные дороги, мосты, транспортные развязки, инженерные сети в условиях Центральной Азии.",
    items: [
      "Автодороги I–IV категории",
      "Мостовые переходы и путепроводы",
      "Магистральные сети",
      "Городское благоустройство",
    ],
  },
];

const projects = [
  { loc: "КАРАГАНДА", name: "Логистический хаб «Сарыарка»", year: "2024—2025", size: "62 000 м²", featured: true },
  { loc: "АЛМАТЫ", name: "Транспортная развязка Восток-1", year: "2023—2024", size: "4.2 км" },
  { loc: "АКТОБЕ", name: "Цех металлопроката №3", year: "2024", size: "18 500 м²" },
  { loc: "ШЫМКЕНТ", name: "Очистные сооружения", year: "2025", size: "24 000 м³/сут" },
  { loc: "АСТАНА", name: "Магистральный мост", year: "2022—2023", size: "680 п.м." },
];

const footerCols = [
  { title: "Компания", links: ["О нас", "Команда", "Сертификаты", "Вакансии"] },
  { title: "Направления", links: ["Промышленное", "Инфраструктура", "Проектирование", "Генподряд"] },
  { title: "Контакты", links: ["Астана · офис", "+7 (7172) 00-00-00", "info@sk-kazalem.kz", "Telegram"] },
];

function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none">
      <g stroke={ochre} strokeWidth="1.2" opacity="0.4" fill="none">
        <circle cx="60" cy="60" r="44" />
        <ellipse cx="60" cy="60" rx="44" ry="18" />
        <ellipse cx="60" cy="60" rx="18" ry="44" />
        <line x1="16" y1="60" x2="104" y2="60" />
      </g>
      <line x1="60" y1="32" x2="60" y2="88" stroke={ochre} strokeWidth="1.5" opacity="0.55" />
      <g fill={ochre}>
        <rect x="22" y="34" width="20" height="6" />
        <rect x="22" y="34" width="6" height="16" />
        <rect x="22" y="57" width="20" height="6" />
        <rect x="36" y="57" width="6" height="23" />
        <rect x="22" y="74" width="20" height="6" />
      </g>
      <g fill={ochre}>
        <rect x="72" y="34" width="6" height="46" />
        <polygon points="78,55 93,34 100,34 85,55" />
        <polygon points="78,59 93,80 100,80 85,59" />
      </g>
    </svg>
  );
}

function Wordmark() {
  return (
    <a href="/" className="flex items-center gap-3 select-none">
      <Logo className="h-10 w-10 shrink-0" />
      <div className="leading-none">
        <div
          className="font-bold uppercase"
          style={{ fontFamily: "var(--font-oswald)", color: bone, letterSpacing: "0.02em", fontSize: 22 }}
        >
          SK<span style={{ color: ochre, margin: "0 4px" }}>—</span>KazAlem
        </div>
        <div
          className="mt-1 uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.3em", color: concrete }}
        >
          СТРОИТЕЛЬСТВО · ИНФРАСТРУКТУРА
        </div>
      </div>
    </a>
  );
}

function Placeholder({
  label,
  ratio = "21/9",
  caption,
}: {
  label: string;
  ratio?: string;
  caption?: string;
}) {
  return (
    <div
      className="sk-stripes relative flex items-center justify-center w-full"
      style={{
        aspectRatio: ratio,
        border: `1px solid ${concrete}`,
      }}
    >
      <div className="text-center">
        <div
          className="inline-block px-4 py-1.5"
          style={{
            border: `1px solid ${ochre}`,
            background: bg,
            color: ochre,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {caption && (
          <div
            className="mt-3 uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.2em",
              color: ochre,
              opacity: 0.6,
            }}
          >
            {caption}
          </div>
        )}
      </div>
      {/* Corner marks */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l" style={{ borderColor: ochre }} />
      <div className="absolute top-2 right-2 w-4 h-4 border-t border-r" style={{ borderColor: ochre }} />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l" style={{ borderColor: ochre }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r" style={{ borderColor: ochre }} />
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "SK—KazAlem · Строим инфраструктуру Казахстана";
  }, []);

  return (
    <div className="sk-page min-h-screen" style={{ background: bg, color: bone }}>
      {/* Announcement bar */}
      <div
        className="px-4 sm:px-12 py-2.5 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between uppercase"
        style={{
          background: deep,
          borderBottom: `1px solid ${surface}`,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: concrete,
        }}
      >
        <div>ТОО «SK-KAZALEM» · БИН 000000000000 · АСТАНА</div>
        <div className="flex gap-6">
          <span>+7 (7172) 00-00-00</span>
          <span style={{ color: ochre }}>RU · KZ · EN</span>
        </div>
      </div>

      {/* Nav */}
      <div
        className="px-4 sm:px-12 py-5 flex items-center justify-between gap-4"
        style={{ borderBottom: `1px solid ${surface}` }}
      >
        <Wordmark />
        <nav
          className="hidden lg:flex gap-9"
          style={{
            fontFamily: "var(--font-oswald)",
            fontSize: 14,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
          }}
        >
          {navItems.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className="pb-1 border-b-2 transition-colors duration-200"
              style={{ color: bone, borderColor: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = ochre;
                (e.currentTarget as HTMLElement).style.borderColor = ochre;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = bone;
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              }}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="/app"
            className="px-5 py-3 whitespace-nowrap transition-colors duration-200"
            style={{
              border: `1px solid ${ochre}`,
              color: ochre,
              fontFamily: "var(--font-oswald)",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = ochre; (e.currentTarget as HTMLElement).style.color = deep; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = ochre; }}
          >
            Войти в систему
          </a>
          <a
            href="#contact"
            className="px-5 py-3 whitespace-nowrap transition-colors duration-200"
            style={{
              background: ochre,
              color: deep,
              fontFamily: "var(--font-oswald)",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = bone)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = ochre)}
          >
            Запросить смету →
          </a>
        </div>
      </div>

      {/* HERO */}
      <section
        className="relative px-4 sm:px-12"
        style={{ borderBottom: `1px solid ${surface}` }}
      >
        {/* Grid overlay lines (desktop only) */}
        <div className="hidden lg:block absolute inset-y-0 left-1/4 w-px opacity-60" style={{ background: surface }} />
        <div className="hidden lg:block absolute inset-y-0 left-1/2 w-px opacity-60" style={{ background: surface }} />
        <div className="hidden lg:block absolute inset-y-0 left-3/4 w-px opacity-60" style={{ background: surface }} />

        <div className="relative pt-12 sm:pt-20 pb-8 sm:pb-16">
          <div
            className="flex flex-col sm:flex-row sm:justify-between gap-2 uppercase mb-8"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: ochre,
              letterSpacing: "0.25em",
            }}
          >
            <span>N 51°10′ · E 71°26′ · АСТАНА</span>
            <span>ОСН. 2008 · ПРОЕКТОВ ВЫПОЛНЕНО: 147</span>
          </div>

          <h1
            className="m-0"
            style={{
              fontFamily: "var(--font-oswald)",
              fontWeight: 700,
              fontSize: "clamp(56px, 11vw, 156px)",
              lineHeight: 0.88,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
            }}
          >
            Строим
            <br />
            <span style={{ color: ochre }}>инфраструктуру</span>
            <br />
            Казахстана
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mt-12 lg:mt-16 items-end">
            <p
              className="m-0 max-w-xl"
              style={{ fontSize: 18, lineHeight: 1.5, color: bone, opacity: 0.85 }}
            >
              Генеральный подрядчик промышленных объектов и инфраструктурных проектов. Мы поставляем, монтируем и сдаём
              «под ключ» объекты любой сложности на всей территории Республики Казахстан.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <a
                href="#projects"
                className="px-8 py-5 transition-colors duration-200 text-center"
                style={{
                  background: ochre,
                  color: deep,
                  fontFamily: "var(--font-oswald)",
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = bone)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = ochre)}
              >
                Смотреть проекты →
              </a>
              <a
                href="#about"
                className="px-8 py-5 text-center"
                style={{
                  background: "transparent",
                  color: bone,
                  border: `1px solid ${concrete}`,
                  fontFamily: "var(--font-oswald)",
                  fontSize: 15,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                О компании
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-12">
          <Placeholder label="INDUSTRIAL · ON-SITE · 2025" caption="wide-format photography of active construction site" />
        </div>
      </section>

      {/* STATS */}
      <section
        className="px-4 sm:px-12 py-12"
        style={{ background: deep, borderBottom: `1px solid ${surface}` }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="pl-5" style={{ borderLeft: `1px solid ${ochre}` }}>
              <div
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: "clamp(48px, 6vw, 72px)",
                  fontWeight: 700,
                  color: ochre,
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div
                className="mt-2 uppercase"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: concrete, letterSpacing: "0.2em" }}
              >
                {s.unit}
              </div>
              <div style={{ fontSize: 13, color: bone, opacity: 0.7, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="px-4 sm:px-12 py-16 lg:py-24"
        style={{ borderBottom: `1px solid ${surface}` }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 mb-12 lg:mb-16">
          <div>
            <div
              className="uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: ochre, letterSpacing: "0.25em" }}
            >
              § 02 — НАПРАВЛЕНИЯ
            </div>
            <h2
              className="m-0"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 700,
                textTransform: "uppercase",
                lineHeight: 0.95,
                letterSpacing: "-0.01em",
              }}
            >
              Что мы
              <br />
              строим
            </h2>
          </div>
          <div className="max-w-sm" style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.6 }}>
            Два ключевых направления, в которых мы обеспечиваем полный цикл: от изысканий до ввода в эксплуатацию.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0.5">
          {services.map((s) => (
            <div
              key={s.num}
              className="p-8 lg:p-12 flex flex-col justify-between"
              style={{ background: surface, minHeight: 480 }}
            >
              <div>
                <div className="flex items-baseline gap-5 mb-6">
                  <div
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontSize: 64,
                      fontWeight: 700,
                      color: ochre,
                      lineHeight: 1,
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-oswald)",
                      fontSize: "clamp(22px, 3vw, 32px)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.title}
                  </div>
                </div>
                <p className="max-w-md" style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
                <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${concrete}` }}>
                  {s.items.map((it) => (
                    <div
                      key={it}
                      className="flex items-center gap-3 py-2"
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        color: bone,
                        opacity: 0.85,
                      }}
                    >
                      <span style={{ color: ochre, fontSize: 10 }}>▸</span>
                      {it}
                    </div>
                  ))}
                </div>
              </div>
              <a
                href="#contact"
                className="mt-8 inline-block pb-1 self-start cursor-pointer"
                style={{
                  color: ochre,
                  fontFamily: "var(--font-oswald)",
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  borderBottom: `1px solid ${ochre}`,
                }}
              >
                Подробнее о направлении →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section
        id="projects"
        className="px-4 sm:px-12 py-16 lg:py-24"
        style={{ borderBottom: `1px solid ${surface}` }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 mb-12">
          <div>
            <div
              className="uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: ochre, letterSpacing: "0.25em" }}
            >
              § 03 — ПОРТФОЛИО
            </div>
            <h2
              className="m-0"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 700,
                textTransform: "uppercase",
                lineHeight: 0.95,
              }}
            >
              Объекты
              <br />
              в работе
            </h2>
          </div>
          <a
            href="#"
            className="uppercase pb-1 inline-block self-start lg:self-end"
            style={{
              color: bone,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.2em",
              borderBottom: `1px solid ${ochre}`,
            }}
          >
            ВСЕ 147 →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 lg:auto-rows-[360px]">
          {projects.map((p, i) => (
            <div
              key={p.name}
              className={`relative overflow-hidden cursor-pointer ${
                p.featured ? "lg:row-span-2 min-h-[360px]" : "min-h-[280px]"
              }`}
              style={{ background: surface }}
            >
              <div className="absolute inset-0 sk-stripes" />
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: ochre }} />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: ochre }} />
              <div
                className="absolute top-5 right-5 uppercase"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: ochre, letterSpacing: "0.2em" }}
              >
                {String(i + 1).padStart(2, "0")} / 05
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{ background: `linear-gradient(180deg, transparent, ${deep})` }}
              >
                <div
                  className="uppercase mb-2"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: ochre, letterSpacing: "0.25em" }}
                >
                  {p.loc} · {p.year}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-oswald)",
                    fontSize: "clamp(18px, 2.5vw, 24px)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: bone,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.name}
                </div>
                <div
                  className="mt-1.5"
                  style={{ fontSize: 12, color: concrete, fontFamily: "var(--font-mono)" }}
                >
                  {p.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="px-4 sm:px-12 py-16 lg:py-20" style={{ background: ochre, color: deep }}>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-10">
          <div>
            <div
              className="uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.25em", opacity: 0.7 }}
            >
              § 04 — СОТРУДНИЧЕСТВО
            </div>
            <h2
              className="m-0"
              style={{
                fontFamily: "var(--font-oswald)",
                fontSize: "clamp(48px, 7vw, 88px)",
                fontWeight: 700,
                textTransform: "uppercase",
                lineHeight: 0.9,
                letterSpacing: "-0.01em",
              }}
            >
              Есть проект?
              <br />
              Обсудим.
            </h2>
          </div>
          <a
            href="mailto:info@sk-kazalem.kz"
            className="px-10 py-6 self-start lg:self-auto text-center whitespace-nowrap"
            style={{
              background: deep,
              color: ochre,
              fontFamily: "var(--font-oswald)",
              fontSize: 18,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Связаться →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-4 sm:px-12 pt-16 pb-8"
        style={{ background: deep, color: concrete, fontSize: 13 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          <div>
            <Wordmark />
            <p className="mt-6 max-w-xs" style={{ lineHeight: 1.6, opacity: 0.7 }}>
              Генеральный подрядчик промышленного и инфраструктурного строительства. Работаем на территории Республики
              Казахстан с 2008 года.
            </p>
          </div>
          {footerCols.map((col) => (
            <div key={col.title}>
              <div
                className="uppercase mb-4"
                style={{
                  fontFamily: "var(--font-oswald)",
                  fontSize: 14,
                  color: bone,
                  letterSpacing: "0.1em",
                }}
              >
                {col.title}
              </div>
              {col.links.map((l) => (
                <div key={l} className="py-1.5 cursor-pointer" style={{ opacity: 0.7 }}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          className="pt-6 flex flex-col sm:flex-row justify-between gap-2 uppercase"
          style={{
            borderTop: `1px solid ${surface}`,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            opacity: 0.5,
          }}
        >
          <span>© 2026 SK-KAZALEM · ВСЕ ПРАВА ЗАЩИЩЕНЫ</span>
          <span>ЛИЦЕНЗИЯ ГСЛ № 00-00000 · ISO 9001:2015</span>
        </div>
      </footer>
    </div>
  );
}
