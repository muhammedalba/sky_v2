import type { Metadata } from "next";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: env.APP_NAME,
  description: env.APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
