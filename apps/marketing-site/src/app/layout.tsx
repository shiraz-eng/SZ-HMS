import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteNavbar } from "@/components/marketing/site-navbar";
import { SiteFooter } from "@/components/marketing/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SZ HMS — Hospital Management System",
    template: "%s · SZ HMS",
  },
  description:
    "SZ HMS is a multi-tenant hospital management platform. EHR, smart scheduling, billing, and inventory in one white-labeled system.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteNavbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
