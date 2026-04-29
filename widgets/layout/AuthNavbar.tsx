'use client';

import { Link } from '@/navigation';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import { useUIStore } from '@/store/ui-store';
import LanguageSwitcher from '@/widgets/layout/LanguageSwitcher';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import Image from 'next/image';
import UserAccountMenu from '@/widgets/layout/UserAccountMenu';
import { env } from '@/lib/env';
import SidebarHeader from './sidebar/SidebarHeader';

export default function AuthNavbar() {
    const t = useTranslations('store.nav');
    const segment = useSelectedLayoutSegment();
    const locale = useLocale();
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, setTheme } = useUIStore();

    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mounted, setMounted] = useState(false);
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SkyGalaxy';
    useEffect(() => {
        setMounted(true);
        const userData = isAuthenticated() ? getUser() : null;
        setUser(userData);
        setIsLoggedIn(!!userData);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns on click outside or escape
    useEffect(() => {
        const handleEvents = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent && e.key === 'Escape') {
                setUserMenuOpen(false);
                setMobileMenuOpen(false);
            }
            if (e instanceof MouseEvent) {
                setUserMenuOpen(false);
            }
        };

        if (userMenuOpen || mobileMenuOpen) {
            document.addEventListener('click', handleEvents as any);
            document.addEventListener('keydown', handleEvents as any);
            return () => {
                document.removeEventListener('click', handleEvents as any);
                document.removeEventListener('keydown', handleEvents as any);
            }
        }
    }, [userMenuOpen, mobileMenuOpen]);

    const navItems = [
        { name: t('home'), href: '/home', active: segment === 'home' || !segment, icon: Icons.Dashboard },
        { name: t('products'), href: '/products', active: segment === 'products', icon: Icons.Products },
        { name: t('contact'), href: '/contact', active: segment === 'contact', icon: Icons.Users },
    ];


    return (
        <>
            <nav
                className={cn(
                    'fixed top-0 w-full z-1000 transition-all duration-500 ease-in-out py-2',
                    scrolled
                        ? ' bg-background/70 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/10'
                        : ' bg-transparent'
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12">
                        {/* Logo */}
                        <Link href="/home" className="flex items-center gap-3 group relative z-110">
                            <Image
                                src="/images/auth-logo.png"
                                alt={`${appName} Logo`}
                                width={50}
                                height={50}
                                className="object-contain m-auto"
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center bg-muted/30 backdrop-blur-md rounded-full px-2 py-1 border border-white/5 shadow-inner">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-6 py-2 text-sm font-bold transition-all duration-300 rounded-full relative overflow-hidden',
                                        item.active
                                            ? 'text-white bg-primary shadow-lg shadow-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 relative z-110">
                            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-muted/40 backdrop-blur-md border border-white/5 rounded-full shadow-inner">
                                <LanguageSwitcher />
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-all duration-300 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 shadow-sm"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'light' ? (
                                        <Icons.Moon className="h-4 w-4" />
                                    ) : (
                                        <Icons.Sun className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                           
                            {/* User Menu */}
                           

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMobileMenuOpen(true);
                                }}
                                className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center bg-muted/40 border border-white/5 backdrop-blur-md hover:bg-accent transition-all shadow-sm"
                            >
                                <Icons.Menu className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar (Drawer) */}
            <div
                className={cn(
                    "fixed inset-0 z-9999 lg:hidden transition-all duration-500",
                    mobileMenuOpen ? "visible" : "invisible pointer-events-none"
                )}
            >
                {/* Overlay */}
                <div
                    className={cn(
                        "absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-500",
                        mobileMenuOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Sidebar Panel */}
                <div
                    className={cn(
                        "absolute top-0 bottom-0 w-[85%] max-w-[340px] bg-background border-r border-border/50 shadow-2xl transition-transform duration-500 ease-out flex flex-col z-[10001]",
                        locale === 'ar'
                            ? (mobileMenuOpen ? "right-0 translate-x-0" : "right-0 translate-x-full")
                            : (mobileMenuOpen ? "left-0 translate-x-0" : "left-0 -translate-x-full")
                    )}
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    <div className="p-6 border-b border-border/50 flex items-center justify-between bg-accent/20">
                        <SidebarHeader locale={locale} />
                        <button  
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                        > 
                            <Icons.X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                        <div className="space-y-2">
                            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">{t('menu')}</p>
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-bold",
                                        item.active
                                            ? "bg-primary text-white shadow-xl shadow-primary/20"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-border/50 space-y-4">
                            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">{t('preference')}</p>

                            {/* Theme Toggle */}
                            <div className="flex items-center justify-between px-4">
                                <span className="text-sm font-bold">{t('theme')}</span>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="w-12 h-6 rounded-full bg-accent relative transition-colors duration-300"
                                >
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm",
                                        theme === 'dark' ? "left-7 bg-primary" : "left-1 bg-muted-foreground"
                                    )}>
                                        {theme === 'dark' ? <Icons.Moon className="w-2.5 h-2.5 text-white" /> : <Icons.Sun className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                </button>
                            </div>

                            {/* Language Switcher */}
                            <div className="flex items-center justify-between px-4">
                                <span className="text-sm font-bold">{t('language')}</span>
                                <LanguageSwitcher variant="secondary" className="rounded-xl h-10 px-4" />
                            </div>
                        </div>
                    </div>

                    <div className=" border-t border-border/50 bg-accent/10">
                       <UserAccountMenu />       
                    </div>
                </div>
            </div>
        </>
    );
}
