import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getServerUser } from '@/lib/auth';
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
  locale?: string; // Optional if you want to pass it explicitly, but we can get it from params usually
}

export default async function Sidebar({ mode = 'desktop', className, onNavigate, locale }: SidebarProps) {
  const t = await getTranslations('navigation');
  const cookieStore = await cookies();
  const user = getServerUser(cookieStore);
  
  // Note: locale is usually passed from the layout
  const l = locale || env.DEFAULT_LOCALE ;

  const navigation: { name: string; href: string; icon: keyof typeof Icons; color: string }[] = [
    { name: t('dashboard'), href: `/${l}/dashboard`, icon: 'Dashboard' ,color: 'primary' },
    { name: t('products'), href: `/${l}/dashboard/products`, icon: 'Products', color: 'destructive' },
    { name: t('productAnalytics'), href: `/${l}/dashboard/products/statistics`, icon: 'BarChart' ,color: 'warning' },
    { name: t('categories'), href: `/${l}/dashboard/categories`, icon: 'Categories', color: 'success' },
    { name: t('subCategories'), href: `/${l}/dashboard/sub-categories`, icon: 'SubCategories', color: 'muted-foreground' },
    { name: t('brands'), href: `/${l}/dashboard/brands`, icon: 'Brands', color: 'success' },
    { name: t('suppliers'), href: `/${l}/dashboard/suppliers`, icon: 'Users', color: 'info' },
    { name: t('coupons'), href: `/${l}/dashboard/coupons`, icon: 'Coupons', color: 'warning' },
    { name: t('carousel'), href: `/${l}/dashboard/carousel`, icon: 'Carousel', color: 'success' },
    { name: t('promoBanners'), href: `/${l}/dashboard/promo-banners`, icon: 'PromoBanners', color: 'destructive' },
    { name: t('orders'), href: `/${l}/dashboard/orders`, icon: 'Orders', color: 'info' },
    { name: t('users'), href: `/${l}/dashboard/users`, icon: 'Users', color: 'warning/80' },
    { name: t('profile'), href: `/${l}/dashboard/profile`, icon: 'User', color: 'primary' },  
    { name: t('settings'), href: `/${l}/dashboard/settings`, icon: 'Settings', color: 'muted-foreground' },
  ];

  return (
    <SidebarClientWrapper mode={mode} className={className}>
      <SidebarHeader locale={l} onNavigate={onNavigate} Collapsed={true} />
      <SidebarNav navigation={navigation} onNavigate={onNavigate} /> 
      <SidebarFooter/>
    </SidebarClientWrapper>
  );
}
