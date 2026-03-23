export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 space-y-2.5 sm:mb-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem] md:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{subtitle}</p> : null}
    </div>
  );
}
