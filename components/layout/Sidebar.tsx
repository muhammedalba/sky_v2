import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { getServerUser } from '@/lib/auth';
import { Icons } from '@/components/ui/Icons';
import SidebarClientWrapper from './sidebar/SidebarClientWrapper';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarNav from './sidebar/SidebarNav';
import SidebarFooter from './sidebar/SidebarFooter';

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
  const l = locale || 'en';

  const navigation: { name: string; href: string; icon: keyof typeof Icons; color: string }[] = [
    { name: t('dashboard'), href: `/${l}/dashboard`, icon: 'Dashboard' ,color: 'blue' },
    { name: t('products'), href: `/${l}/dashboard/products`, icon: 'Products', color: 'emerald' },
    { name: t('categories'), href: `/${l}/dashboard/categories`, icon: 'Categories', color: 'orange' },
    { name: t('subCategories'), href: `/${l}/dashboard/sub-categories`, icon: 'SubCategories', color: 'amber' },
    { name: t('brands'), href: `/${l}/dashboard/brands`, icon: 'Brands', color: 'purple' },
    { name: t('suppliers'), href: `/${l}/dashboard/suppliers`, icon: 'Users', color: 'cyan' },
    { name: t('coupons'), href: `/${l}/dashboard/coupons`, icon: 'Coupons', color: 'rose' },
    { name: t('carousel'), href: `/${l}/dashboard/carousel`, icon: 'Carousel', color: 'sky' },
    { name: t('promoBanners'), href: `/${l}/dashboard/promo-banners`, icon: 'PromoBanners', color: 'pink' },
    { name: t('orders'), href: `/${l}/dashboard/orders`, icon: 'Orders', color: 'violet' },
    { name: t('users'), href: `/${l}/dashboard/users`, icon: 'Users', color: 'indigo' },
    { name: t('profile'), href: `/${l}/dashboard/profile`, icon: 'User', color: 'teal' },
    { name: t('settings'), href: `/${l}/dashboard/settings`, icon: 'Settings', color: 'slate' },
  ];

  return (
    <SidebarClientWrapper mode={mode} className={className}>
      <SidebarHeader locale={l} onNavigate={onNavigate} />
      <SidebarNav navigation={navigation} onNavigate={onNavigate} /> 
      <SidebarFooter user={user} />
    </SidebarClientWrapper>
  );
}
