import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://fpsviet.com"),
  title: {
    default: "Fpsviet.com - Máy này chơi được game gì?",
    template: "%s | Fpsviet.com",
  },
  description: "Tra FPS game theo cấu hình PC/laptop, xem setting đề xuất và tìm laptop phù hợp cho game thủ Việt Nam.",
  openGraph: {
    siteName: "Fpsviet.com",
    locale: "vi_VN",
    type: "website",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Header />
        {children}
        <Footer />
        {ga ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
