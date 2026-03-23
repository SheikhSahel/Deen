import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  id: string;
  className?: string;
}

export function PageShell({ title, subtitle, children, actions, id, className }: PageShellProps) {
  return (
    <section
      aria-labelledby={id}
      className={cn("page-shell space-y-5 sm:space-y-6", className)}
    >
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="space-y-2.5">
          <h1 id={id} className="text-2xl font-semibold tracking-tight sm:text-[1.75rem] md:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
