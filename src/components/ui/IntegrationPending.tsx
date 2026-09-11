import { Icon } from "./Icon";

export function IntegrationPending({
  icon, title, body, needs,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  body: string;
  needs: string[];
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10 px-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#E7F5EC] text-[var(--color-primary)] flex items-center justify-center">
        <Icon name={icon} className="w-8 h-8" />
      </div>
      <div>
        <div className="font-[var(--font-head)] font-bold text-[18px] text-[var(--color-dark)] mb-2">{title}</div>
        <p className="text-[13.5px] text-[#5E7568] leading-relaxed">{body}</p>
      </div>
      <div className="w-full bg-[var(--color-mist-2)] rounded-2xl p-4 text-left">
        <div className="text-[11.5px] font-bold text-[#5E7568] uppercase tracking-wide mb-2">To go live, this needs:</div>
        <ul className="flex flex-col gap-1.5">
          {needs.map((n) => (
            <li key={n} className="text-[13px] text-[var(--color-dark)] flex gap-2">
              <span className="text-[var(--color-secondary)]">•</span>{n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
