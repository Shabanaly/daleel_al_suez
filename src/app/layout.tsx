import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/presentation/components/theme-provider";
import { VisitTracker } from '@/components/analytics/VisitTracker'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/sonner"
import { ChatWidget } from "@/presentation/components/ai/chat-widget"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-kufi",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

import { SupabaseSettingsRepository } from "@/data/repositories/supabase-settings.repository";

export async function generateMetadata(): Promise<Metadata> {
  const settingsRepository = new SupabaseSettingsRepository();
  const settings = await settingsRepository.getPublicSettings();

  return {
    title: settings.site_name || "دليل السويس | كل ما تحتاجه في مكان واحد",
    description: settings.site_description || "الدليل الشامل لمدينة السويس. اكتشف أفضل المطاعم، الكافيهات، الخدمات، والفعاليات في السويس.",
    verification: {
      google: "nCp3t2Ck8dUCPc6Jv9YMyoCYPeIvOmNNRFEfZ-ttH98",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        notoKufi.variable,
        "font-sans antialiased bg-background text-foreground"
      )} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VisitTracker />
          {children}
          <SpeedInsights />
          <ChatWidget />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
