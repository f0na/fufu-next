import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RightSidebarPortalProvider } from "@/context/right-sidebar-portal-context";
import { GlobalLive2D } from "@/components/mascot/global-live2d";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fufu's Site",
  description: "二次元少女乐队风格的个人网站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 预加载 Cubism SDK */}
        <script src="/live2d/live2dcubismcore.min.js" async />
      </head>
      <body className="min-h-full flex flex-col">
        <RightSidebarPortalProvider>
          {children}
          <GlobalLive2D />
        </RightSidebarPortalProvider>
      </body>
    </html>
  );
}
