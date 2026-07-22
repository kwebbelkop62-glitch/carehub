import type { Metadata } from "next";
import { Figtree, Lora } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

// Runs before hydration so the correct theme applies on first paint —
// otherwise there's a flash of light mode before React mounts and the
// toggle's own effect can read localStorage.
const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CareHub",
  description: "Manage appointments across hospitals, clinics, and labs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <ClerkProvider>
      <html
        lang={locale}
        className={`${figtree.variable} ${lora.variable} h-full scroll-smooth antialiased`}
        suppressHydrationWarning
      >
        <head>
          <Script id="theme-init" strategy="beforeInteractive">
            {THEME_INIT_SCRIPT}
          </Script>
        </head>
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
