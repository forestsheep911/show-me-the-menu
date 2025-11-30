import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-sans-sc",
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
        className={`${notoSansSC.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
