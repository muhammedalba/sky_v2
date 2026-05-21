import { ReactNode } from "react";
import AuthNavbar from "@/widgets/layout/AuthNavbar";
import StoreFooter from "@/widgets/layout/StoreFooter";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Enable next-intl request deduplication — prevents re-loading all JSON files on locale switch
  setRequestLocale(locale);

  const allMessages = await getMessages();
  const authLayoutMessages = {
    common: allMessages.common,
    auth: allMessages.auth,
    buttons: allMessages.buttons,
    errors: allMessages.errors,
    navigation: allMessages.navigation,
    messages: allMessages.messages,
    shipping: allMessages.shipping,
    shippingRates: allMessages.shippingRates,
    taxes: allMessages.taxes,
    maintenance: allMessages.maintenance,
    notifications: allMessages.notifications,
    store: allMessages.store,
  };

  return (
    <NextIntlClientProvider messages={authLayoutMessages}>
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <AuthNavbar />
        <main className="flex-1 ">{children}</main>
        <StoreFooter />
      </div>
    </NextIntlClientProvider>
  );
}
