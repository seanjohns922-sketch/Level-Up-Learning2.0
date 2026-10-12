import { Barlow, Montserrat } from "next/font/google";

// Free web stand-ins for the RELIQ brand fonts (Reliq brand guide V6):
// Montserrat for Gotham Ultra (display headings); Barlow for Conduit ITC
// (subheadings, navigation, controls and body copy).
// Swap these for the licensed web fonts when the final brand files arrive.
export const brandHeading = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-brand-heading", display: "swap" });
export const brandBody = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-brand-body", display: "swap" });
/** RootLayout installs these variables globally; retained for scoped brand surfaces. */
export const brandFontScope = `${brandHeading.variable} ${brandBody.variable} ${brandBody.className}`;
