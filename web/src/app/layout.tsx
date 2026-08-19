import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/use-toast";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Entrepreneurial Action`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Entrepreneurial Action`,
    description: SITE_TAGLINE,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Entrepreneurial Action`,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}