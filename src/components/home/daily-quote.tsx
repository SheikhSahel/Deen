import { DAILY_QUOTES } from "@/lib/constants";
import { GlassCard } from "@/components/shared/glass-card";

function getQuoteOfTheDay() {
  const day = new Date().getDate();
  return DAILY_QUOTES[day % DAILY_QUOTES.length];
}

export function DailyQuote() {
  const quote = getQuoteOfTheDay();

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold sm:text-xl">দৈনিক ইসলামিক বাণী</h3>
      <p className="arabic-text mt-4 text-right text-2xl leading-relaxed text-amber-500 sm:text-[1.9rem]">{quote.arabic}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{quote.translation}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-500">{quote.source}</p>
    </GlassCard>
  );
}
