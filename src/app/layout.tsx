import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rwanda Government Intelligence Platform",
  description: "Decision intelligence platform transforming government data into decisive action for national development",
  keywords: ["government", "intelligence", "rwanda", "decision-making", "data", "analytics"],
  authors: [{ name: "Government of Rwanda" }],
  openGraph: {
    title: "Rwanda Government Intelligence Platform",
    description: "Transforming government data into decisive action",
    type: "website",
    locale: "en_RW"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
