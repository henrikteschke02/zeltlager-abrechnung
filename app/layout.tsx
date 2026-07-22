import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Manrope, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Clean, modern Sans-Serif for all body text, buttons, labels
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Elegant Serif ONLY for logo, big headings, price numbers
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zeltlager Manager",
  description: "Digitale Getränke-, Grillfleisch- und Brötchen-Abrechnung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${manrope.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="standard"
          themes={["light", "standard", "dark"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
