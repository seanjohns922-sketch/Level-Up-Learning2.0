"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PostTestTransition({ year }: { year: string }) {
  const router = useRouter();
  const [mounted] = useState(true);

  function startPostTest() {
    router.push(`/posttest?year=${encodeURIComponent(year)}`);
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating celebration shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["🎉", "⭐", "🏆", "✨", "🎊", "💪"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 3) * 25}%`,
              animation: `floatEmoji ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div
        className="relative z-10 w-full max-w-md text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="bg-card rounded-3xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Top gradient band */}
          <div
            className="h-2"
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
            }}
          />

          <div className="p-8 space-y-6">
            {/* Big celebration emoji */}
            <div
              className="text-6xl"
              style={{
                animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
              }}
            >
              🎉
            </div>

            <div>
              <h1 className="text-3xl font-extrabold font-display text-foreground">
                Great work!
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                You&apos;ve finished your final practice.
                <br />
                Now it&apos;s time for your <span className="font-bold text-foreground">Post-Test</span>.
              </p>
            </div>

            {/* Info card */}
            <div className="rounded-2xl border border-primary/20 bg-primary-light p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <span className="font-bold text-sm text-foreground">What to expect</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  A short set of questions covering everything you&apos;ve learned
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  Score 90% or higher to unlock your Legend
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  You can always retry if you need more practice
                </li>
              </ul>
            </div>

            {/* CTA */}
            <button
              onClick={startPostTest}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-extrabold text-lg hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
              style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
            >
              🚀 Start Post-Test
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatEmoji {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-15px) rotate(10deg); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
