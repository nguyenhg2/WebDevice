import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://maynaychoiduoc.vn"), title: { default: "Máy Này Chơi Được Game Gì?", template: "%s | MáyNàyChơiĐược.vn" }, description: "Tra cứu game theo cấu hình PC/laptop, xem FPS ước tính, setting đề xuất và thiết bị phù hợp cho game thủ Việt Nam.", openGraph: { siteName: "MáyNàyChơiĐược.vn", locale: "vi_VN", type: "website" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { const ga = process.env.NEXT_PUBLIC_GA_ID; return <html lang="vi" suppressHydrationWarning><body><Header /><main>{children}</main><Footer />{ga ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" /><Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script></> : null}</body></html>; }
