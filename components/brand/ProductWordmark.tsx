import Image from "next/image";

/**
 * RELIQ logo. "onDark" has white letters for dark backgrounds (the login page);
 * "onLight" keeps the black letters. Both keep the purple Q.
 * Source artwork is a 664 px PNG; swap in an SVG when the final file is supplied.
 */
export default function ProductWordmark({ variant = "onDark", className = "" }: { variant?: "onDark" | "onLight"; className?: string }) {
  return (
    <Image
      src={variant === "onDark" ? "/brand/reliq-logo-on-dark.png" : "/brand/reliq-logo.png"}
      alt="RELIQ"
      width={472}
      height={134}
      priority
      className={`h-auto w-[240px] drop-shadow-[0_4px_20px_rgb(0_0_0/0.5)] sm:w-[300px] ${className}`}
    />
  );
}
