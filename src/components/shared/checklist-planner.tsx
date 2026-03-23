"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Item = { id: string; label: string };

export function ChecklistPlanner({
  title,
  storageKey,
  items,
}: {
  title: string;
  storageKey: string;
  items: Item[];
}) {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) setChecked(parsed);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const progress = useMemo(() => Math.round((checked.length / items.length) * 100), [checked.length, items.length]);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ checked }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${storageKey}-progress.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importProgress = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text) as { checked?: string[] };
        if (Array.isArray(parsed.checked)) {
          setChecked(parsed.checked.filter((id) => items.some((item) => item.id === id)));
        }
      } catch {
        return;
      }
    };
    input.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">অগ্রগতি: {progress}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-emerald-900/30">
        <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid gap-2">
        {items.map((item) => {
          const active = checked.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setChecked((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]))
              }
              className={`rounded-lg border px-3 py-2 text-left text-sm ${
                active ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-400/20"
              }`}
            >
              {active ? "✓ " : "○ "}
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-full" onClick={exportProgress}>
          <Download className="mr-1 h-4 w-4" /> এক্সপোর্ট
        </Button>
        <Button variant="outline" className="rounded-full" onClick={importProgress}>
          <Upload className="mr-1 h-4 w-4" /> ইমপোর্ট
        </Button>
      </div>
    </div>
  );
}
