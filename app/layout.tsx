import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "E-Commerce Admin Dashboard",
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION || "Manage your e-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
