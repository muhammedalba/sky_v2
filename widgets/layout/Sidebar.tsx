import { getTranslations } from 'next-intl/server';
import { Icons } from '@/shared/ui/Icons';
import SidebarClientWrapper from './sidebar/SidebarClientWrapper';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';
import { env } from '@/lib/env';

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
    { name: t('dashboard'), href: `/${l}/dashboard`, icon: 'Dashboard', color: 'primary', permission: 'view_dashboard_stats' },
    { name: t('productAnalytics'), href: `/${l}/dashboard/products/statistics`, icon: 'BarChart', color: 'warning', permission: 'view_products_stats' },
    { name: t('categories'), href: `/${l}/dashboard/categories`, icon: 'Categories', color: 'success', permission: 'view_categories' },
    { name: t('subCategories'), href: `/${l}/dashboard/sub-categories`, icon: 'SubCategories', color: 'muted-foreground', permission: 'view_sub_categories' },
    { name: t('brands'), href: `/${l}/dashboard/brands`, icon: 'Brands', color: 'success', permission: 'view_brands' },
    { name: t('suppliers'), href: `/${l}/dashboard/suppliers`, icon: 'Users', color: 'info', permission: 'view_suppliers' },
    { name: t('products'), href: `/${l}/dashboard/products`, icon: 'Products', color: 'destructive', permission: 'view_products' },
    { name: t('coupons'), href: `/${l}/dashboard/coupons`, icon: 'Coupons', color: 'warning', permission: 'view_coupons' },
    { name: t('carousel'), href: `/${l}/dashboard/carousel`, icon: 'Carousel', color: 'success', permission: 'view_carousels' },
    { name: t('promoBanners'), href: `/${l}/dashboard/promo-banners`, icon: 'PromoBanners', color: 'destructive', permission: 'view_promo_banners' },
    { name: t('orders'), href: `/${l}/dashboard/orders`, icon: 'Orders', color: 'info', permission: 'view_orders' },
    { name: t('shipping'), href: `/${l}/dashboard/shipping`, icon: 'Truck', color: 'primary', permission: 'view_shipping' },
    { name: t('shippingRates'), href: `/${l}/dashboard/shipping-rates`, icon: 'DollarSign', color: 'success', permission: 'view_shipping_rates' },
    { name: t('taxes'), href: `/${l}/dashboard/taxes`, icon: 'DollarSign', color: 'warning', permission: 'view_taxes' },
    { name: t('locations'), href: `/${l}/dashboard/locations`, icon: 'MapPin', color: 'success', permission: 'view_locations' },
    { name: t('users'), href: `/${l}/dashboard/users`, icon: 'Users', color: 'warning/80', permission: 'view_users' },
    { name: t('roles'), href: `/${l}/dashboard/roles`, icon: 'Shield', color: 'destructive', permission: 'view_roles' },
    { name: t('notifications'), href: `/${l}/dashboard/notifications`, icon: 'Bell', color: 'warning', permission: 'update_settings' },
    { name: t('profile'), href: `/${l}/dashboard/profile`, icon: 'User', color: 'primary' },
    { name: t('externalPlatforms'), href: `/${l}/dashboard/external-platforms`, icon: 'Command', color: 'primary', permission: 'view_external-platforms' },
    { name: t('settings'), href: `/${l}/dashboard/settings`, icon: 'Settings', color: 'muted-foreground', permission: 'view_settings' },
  ];

  return (
    <SidebarClientWrapper mode={mode} className={className}>
      <SidebarHeader onNavigate={onNavigate} Collapsed={true} />
      <SidebarNav navigation={navigation} onNavigate={onNavigate} />
      <SidebarFooter />
    </SidebarClientWrapper>
  );
}
