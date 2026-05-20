import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerUserFromToken, checkUserPermission } from "@/lib/auth";
import { User } from "@/types";
import DashboardLayout from "@/widgets/layout/DashboardLayout";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { AsyncBoundary } from "@/shared/ui/boundaries/AsyncBoundary";
import { Permissions } from "@/features/roles/types";

export default async function DashboardLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();

  // Server-side check using JWT from HttpOnly cookie
  const token = cookieStore.get("access_token")?.value;
  const user = token ? getServerUserFromToken(token) : null;
  if (!token || !user) {
    redirect(`/${locale}/login`);
  }
  // Permission-based check
  // Note: JWT payload has user.level which checkUserPermission uses.
  const isAllowed = checkUserPermission(
    user as unknown as User,
    Permissions.ACCESS_DASHBOARD,
  );

  if (!isAllowed) {
    redirect(`/${locale}/home`);
  }

  // Fetch all messages on the server and filter for the client dashboard sub-tree
  const allMessages = await getMessages();
  const dashboardMessages = {
    // Root layout messages
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
    // Admin specific messages
    dashboard: allMessages.dashboard,
    notifications: allMessages.notifications,
    roles: allMessages.roles,
    users: allMessages.users,
    products: allMessages.products,
    categories: allMessages.categories,
    subCategories: allMessages.subCategories,
    orders: allMessages.orders,
    brands: allMessages.brands,
    carousel: allMessages.carousel,
    promoBanners: allMessages.promoBanners,
    coupons: allMessages.coupons,
    settings: allMessages.settings,
    locations: allMessages.locations,
    suppliers: allMessages.suppliers,
    profile: allMessages.profile,
  };

  return (
    <NextIntlClientProvider locale={locale} messages={dashboardMessages}>
      <DashboardLayout locale={locale}>
        <AsyncBoundary>{children}</AsyncBoundary>
      </DashboardLayout>
    </NextIntlClientProvider>
  );
}
