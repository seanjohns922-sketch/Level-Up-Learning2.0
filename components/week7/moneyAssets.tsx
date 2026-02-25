"use client";

import Image from "next/image";

export const COINS = [
  { value: 10, src: "/coins/note-10.png", label: "$10", type: "note" as const },
  { value: 5, src: "/coins/note-5.png", label: "$5", type: "note" as const },
  { value: 2, src: "/coins/coin-2.png", label: "$2", type: "coin" as const },
  { value: 1, src: "/coins/coin-1.png", label: "$1", type: "coin" as const },
];

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
  if (picks.length === 0) return <div className="text-sm text-gray-500">$0</div>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {picks.map((coin, i) => (
        <Image
          key={`${coin.value}-${i}`}
          src={coin.src}
          alt={coin.label}
          width={coin.type === "note" ? 70 : 44}
          height={coin.type === "note" ? 44 : 44}
          className={coin.type === "note" ? "h-11 w-20 object-contain" : "h-11 w-11 object-contain"}
        />
      ))}
    </div>
  );
}
