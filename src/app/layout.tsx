import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Serif_SC } from "next/font/google";
import { ClientProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const notoSerif = Noto_Serif_SC({ variable: "--font-serif", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Couple Agent Space",
  description: "情侣专属的私密生活协作系统"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="blue" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("line-dog-theme");if(t==="pink"||t==="blue")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()` }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
