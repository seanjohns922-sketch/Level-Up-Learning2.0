"use client";

/* eslint-disable @next/next/no-img-element */

export const COINS = [
  { value: 20, src: "/coins/note-20.png", label: "$20", type: "note" as const },
  { value: 10, src: "/coins/note-10.png", label: "$10", type: "note" as const },
  { value: 5, src: "/coins/note-5.png", label: "$5", type: "note" as const },
  { value: 2, src: "/coins/coin-2.png", label: "$2", type: "coin" as const },
  { value: 1, src: "/coins/coin-1.png", label: "$1", type: "coin" as const },
];

// The coin pictures sit on white, so they blend into the card. A real $1 coin is bigger than a $2 coin.
export function moneyClass(coin: { type: "coin" | "note"; value: number }) {
  if (coin.type === "note") return "h-[72px] w-36 object-contain drop-shadow";
  return `${coin.value === 2 ? "h-14 w-14" : "h-[68px] w-[68px]"} object-contain mix-blend-multiply`;
}

export function renderCoins(amount: number) {
  let remaining = amount;
  const picks: Array<{
    value: number;
    src: string;
    label: string;
    type: "coin" | "note";
  }> = [];
  for (const coin of COINS) {
    while (remaining >= coin.value) {
      picks.push(coin);
      remaining -= coin.value;
    }
  }
  if (picks.length === 0) return <div className="text-sm text-slate-500">$0</div>;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {picks.map((coin, i) => (
        <img
          key={`${coin.value}-${i}`}
          src={coin.src}
          alt={coin.label}
          className={moneyClass(coin)}
        />
      ))}
    </div>
  );
}
