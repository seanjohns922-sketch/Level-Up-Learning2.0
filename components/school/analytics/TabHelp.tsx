"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import type { TabHelpContent } from "@/lib/analytics-help";

/** The little ? in the top-right corner of a School Analytics tab. It opens
 * how to read the tab: what it shows, where the numbers come from, what to
 * do with it, and the key words. */
export default function TabHelp({ content }: { content: TabHelpContent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative z-20 -mb-2 flex justify-end" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={content.title}
        title={content.title}
        className={`grid h-9 w-9 place-items-center rounded-full border-[1.5px] text-base font-extrabold transition ${
          open
            ? "border-[#121314] bg-[#121314] text-[#83E300] shadow-[0_0_0_4px_rgba(131, 227, 0,0.45)]"
            : "border-slate-300 bg-white text-[#121314] shadow-sm hover:border-[#121314]"
        }`}
      >
        ?
      </button>
      {open ? (
        <section
          id={panelId}
          role="dialog"
          aria-label={content.title}
          className="absolute right-0 top-[calc(100%+12px)] w-[min(820px,calc(100vw-32px))] rounded-2xl border border-slate-200 bg-white p-5 text-[#121314] shadow-[0_18px_40px_rgba(18,19,20,0.16)] sm:p-6"
        >
          <span className="absolute -top-[7px] right-3 h-3 w-3 rotate-45 border-l border-t border-slate-200 bg-white" aria-hidden="true" />
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg font-extrabold">{content.title}</h3>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-sm font-bold text-[#3D6600] hover:underline">
              Close <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {content.parts.map((part, index) => (
              <div key={part.title}>
                <p className="flex items-start gap-2 font-bold">
                  <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[#121314] text-xs font-extrabold text-[#83E300]">{index + 1}</span>
                  {part.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">{part.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-x-6 gap-y-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
            {content.terms.map((term) => (
              <p key={term.term} className="flex items-start gap-2.5 text-sm leading-5 text-slate-700">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px]" style={{ background: term.swatch, border: `1px solid ${term.border ?? term.swatch}` }} aria-hidden="true" />
                <span><strong className="text-[#121314]">{term.term}</strong> {term.text}</span>
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
