import { getTranslations } from 'next-intl/server';
import { Icons } from '@/shared/ui/Icons';
import SidebarClientWrapper from './sidebar/SidebarClientWrapper';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';
import { env } from '@/lib/env';
import { Permissions } from '@/features/roles/types';

interface SidebarProps {
  mode?: 'desktop' | 'mobile';
  className?: string;
  onNavigate?: () => void;
  locale?: string;
}

export default async function Sidebar({ mode = 'desktop', className, onNavigate, locale }: SidebarProps) {
  const t = await getTranslations('navigation');

  // Note: locale is usually passed from the layout
  const l = locale || env.DEFAULT_LOCALE;

  const navigation: { name: string; href: string; icon: keyof typeof Icons; color: string; permission?: string | string[] }[] = [
    { name: t('dashboard'), href: `/${l}/dashboard`, icon: 'Dashboard', color: 'primary', permission: Permissions.VIEW_DASHBOARD_STATS },
    { name: t('productAnalytics'), href: `/${l}/dashboard/products/statistics`, icon: 'BarChart', color: 'warning', permission: Permissions.VIEW_PRODUCTS_STATS },
    { name: t('categories'), href: `/${l}/dashboard/categories`, icon: 'Categories', color: 'success', permission: Permissions.VIEW_CATEGORIES },
    { name: t('subCategories'), href: `/${l}/dashboard/sub-categories`, icon: 'SubCategories', color: 'muted-foreground', permission: Permissions.VIEW_SUB_CATEGORIES },
    { name: t('brands'), href: `/${l}/dashboard/brands`, icon: 'Brands', color: 'success', permission: Permissions.VIEW_BRANDS },
    { name: t('suppliers'), href: `/${l}/dashboard/suppliers`, icon: 'Users', color: 'info', permission: Permissions.VIEW_SUPPLIERS },
    { name: t('products'), href: `/${l}/dashboard/products`, icon: 'Products', color: 'destructive', permission: Permissions.VIEW_PRODUCTS },
    { name: t('coupons'), href: `/${l}/dashboard/coupons`, icon: 'Coupons', color: 'warning', permission: Permissions.VIEW_COUPONS },
    { name: t('carousel'), href: `/${l}/dashboard/carousel`, icon: 'Carousel', color: 'success', permission: Permissions.VIEW_CAROUSEL },
    { name: t('promoBanners'), href: `/${l}/dashboard/promo-banners`, icon: 'PromoBanners', color: 'destructive', permission: Permissions.VIEW_PROMO_BANNERS },
    { name: t('orders'), href: `/${l}/dashboard/orders`, icon: 'Orders', color: 'info', permission: Permissions.VIEW_ORDERS },
    { name: t('shipping'), href: `/${l}/dashboard/shipping`, icon: 'Truck', color: 'primary', permission: Permissions.VIEW_SHIPPING },
    { name: t('shippingRates'), href: `/${l}/dashboard/shipping-rates`, icon: 'DollarSign', color: 'success', permission: Permissions.VIEW_SHIPPING_RATES },
    { name: t('taxes'), href: `/${l}/dashboard/taxes`, icon: 'DollarSign', color: 'warning', permission: Permissions.VIEW_TAXES },
    { name: t('locations'), href: `/${l}/dashboard/locations`, icon: 'MapPin', color: 'success', permission: Permissions.VIEW_LOCATIONS },
    { name: t('users'), href: `/${l}/dashboard/users`, icon: 'Users', color: 'warning/80', permission: Permissions.VIEW_USERS },
    { name: t('roles'), href: `/${l}/dashboard/roles`, icon: 'Shield', color: 'destructive', permission: Permissions.VIEW_ROLES },
    { name: t('notifications'), href: `/${l}/dashboard/notifications`, icon: 'Bell', color: 'warning', permission: Permissions.SEND_NOTIFICATION },
    { name: t('profile'), href: `/${l}/dashboard/profile`, icon: 'User', color: 'primary' },
    { name: t('externalPlatforms'), href: `/${l}/dashboard/external-platforms`, icon: 'Command', color: 'primary', permission: Permissions.VIEW_EXTERNAL_PLATFORMS },
    { name: t('settings'), href: `/${l}/dashboard/settings`, icon: 'Settings', color: 'muted-foreground', permission: Permissions.VIEW_SETTINGS },
  ];

  return (
    <SidebarClientWrapper mode={mode} className={className}>
      <SidebarHeader onNavigate={onNavigate} Collapsed={true} />
      <SidebarNav navigation={navigation} onNavigate={onNavigate} />
      <SidebarFooter />
    </SidebarClientWrapper>
  );
}
