import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const display = Noto_Serif_TC({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "英文打字金幣挑戰",
  description:
    "金幣從上方落下，在碰到終點線前打對中央的英文。瀏覽器即可遊玩，無需安裝。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="dark">
      <body
        className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
