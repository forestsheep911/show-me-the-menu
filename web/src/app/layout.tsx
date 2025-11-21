import type { Metadata } from "next";
import { ZCOOL_KuaiLe } from "next/font/google";
import "./globals.css";

const zcoolKuaiLe = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"], // Note: Google Fonts subsets for Chinese fonts might be limited in Next.js loader, but we can try or use preload: false
  preload: false,
  variable: "--font-zcool",
});

export const metadata: Metadata = {
  title: "本周美味食谱 🍽️",
  description: "幸福家庭 • 本周食谱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${zcoolKuaiLe.variable} antialiased font-zcool`}
      >
        {children}
      </body>
    </html>
  );
}
