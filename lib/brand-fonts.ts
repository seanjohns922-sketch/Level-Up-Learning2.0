import { Barlow, Montserrat } from "next/font/google";

// Free web stand-ins for the RELIQ brand fonts (Reliq brand guide V6):
// Montserrat for Gotham (headings, buttons) and Barlow for Conduit ITC (body copy).
// Swap these for the licensed web fonts when the final brand files arrive.
export const brandHeading = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-brand-heading", display: "swap" });
export const brandBody = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-brand-body", display: "swap" });
/** Apply to a container: body copy in the brand body font, buttons in the heading font. */
export const brandFontScope = `${brandHeading.variable} ${brandBody.variable} ${brandBody.className} [&_button]:[font-family:var(--font-brand-heading)]`;
