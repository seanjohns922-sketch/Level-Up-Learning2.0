import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalTapFeedback } from "@/components/GlobalTapFeedback";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import StudentScreenRecorder from "@/components/StudentScreenRecorder";
import DemoPreviewBanner from "@/components/demo/DemoPreviewBanner";
import GemRevealHost from "@/components/gems/GemRevealHost";
import VercelClientInsights from "@/components/VercelClientInsights";

export const metadata: Metadata = {
  title: "RELIQ — Explore. Learn. Collect.",
  description: "Explore curriculum Realms, learn at your own pace and collect RELIQS. RELIQ by BrightUp Education.",
  applicationName: "RELIQ",
  openGraph: {
    title: "RELIQ — Explore. Learn. Collect.",
    description: "Explore curriculum Realms, learn at your own pace and collect RELIQS. RELIQ by BrightUp Education.",
    siteName: "RELIQ",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "RELIQ — Explore. Learn. Collect.",
    description: "Explore curriculum Realms, learn at your own pace and collect RELIQS. RELIQ by BrightUp Education.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <GlobalTapFeedback />
          <FullscreenToggle />
          <StudentScreenRecorder />
          <Suspense fallback={null}>
            <DemoPreviewBanner />
          </Suspense>
          {children}
          <GemRevealHost />
          {process.env.NODE_ENV === "production" ? <VercelClientInsights /> : null}
        </ErrorBoundary>
      </body>
    </html>
  );
}
