'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { User } from '@/types';
import LogoutButton from './topbar/LogoutButton';


/**
 * UserAccountMenu Component
 * 
 * A standalone, reusable user account dropdown that dynamically adapts 
 * based on the user's authentication state.
 * 
 * Features:
 * - Handles Authenticated vs Unauthenticated states
 * - Responsive touch/click interactions
 * - Click-outside and Escape key detection
 * - ARIA accessibility compliance
 * - Logical properties support (RTL/LTR)
 */
export default function UserAccountMenu({ iconOnly = false, dir = "bottom" }: { iconOnly?: boolean, dir?: string }) {
    const t = useTranslations('store.nav');
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    let bottom = dir === "top" ? " inset-e-0 top-full" : " inset-s-0 bottom-full";


    // Initialize auth state on mount
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = isAuthenticated();
            const userData = authStatus ? getUser() : null;
            setUser(userData);
            setIsLoggedIn(authStatus);
        };
        checkAuth();

        // Listen for potential auth changes (if your app emits events)
        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    // Toggle dropdown
    const toggleMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    // Handle interactions: Click outside and Keyboard (Escape)
    useEffect(() => {
        const handleEvents = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent && e.key === 'Escape') {
                setIsOpen(false);
            }
            if (e instanceof MouseEvent && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleEvents);
            document.addEventListener('keydown', handleEvents);
            return () => {
                document.removeEventListener('mousedown', handleEvents);
                document.removeEventListener('keydown', handleEvents);
            };
        }
    }, [isOpen]);

    return (
        <div ref={menuRef} className={cn(iconOnly ? "bg-transparent m-4 relative" : "relative flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50  m-3 p-2 shadow-sm hover:border-primary/30 transition-colors group")}>
            {/* Trigger Button */}
            <button
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={isLoggedIn ? `User menu for ${user?.name}` : "User account menu"}
                className={cn(
                    "relative flex items-center justify-center h-11 w-11 rounded-full border-2 transition-all duration-300",
                    "hover:border-primary active:scale-95 shadow-lg",
                    isOpen ? "border-primary ring-2 ring-primary/20" : "border-white/20 bg-muted/40"
                )}
            >
                {isLoggedIn ? (
                    user?.avatar ? (
                        <ImageWithFallback
                            src={user.avatar}
                            alt={user.name || "User Avatar"}
                            fill
                            className="object-cover rounded-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary to-info flex items-center justify-center text-white font-black text-sm">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )
                ) : (
                    <Icons.User className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
            </button>
            {/*  */}
            {!iconOnly && <div className="flex-1 flex justify-between items-center gap-3">
                <div className=" relative flex flex-col min-w-0">
                    <div className="absolute inset-e-1/3  bottom-1 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-bold truncate text-foreground leading-tight">{user?.name || 'login please'}</span>
                    <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">{user?.role || 'offline'}</span>
                </div>
                {isLoggedIn && <LogoutButton iconOnly={true} />}
            </div>}
            {/* Dropdown Menu */}
            {/* {isOpen && (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    className={cn(
                        "absolute  inset-s-0 bottom-full  mt-3 w-64 bg-background border border-border/50 rounded-3xl shadow-2xl p-2 z-150",
                        "animate-in fade-in zoom-in-95 duration-200"
                    )}
                >
                    {isLoggedIn ? (
                        <div className="flex flex-col">
                            <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-accent/10 rounded-t-2xl">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-md shrink-0">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black truncate">{user?.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </div>
                            <div className="py-2">
                                <MenuLink
                                    href="/profile"
                                    icon={Icons.User}
                                    label={t('profile')}
                                    onSelect={() => setIsOpen(false)}
                                />
                                <MenuLink
                                    href="/orders"
                                    icon={Icons.Products}
                                    label={t('orders')}
                                    onSelect={() => setIsOpen(false)}
                                />
                                <div className="h-px bg-border/50 my-1 mx-2" />
                                <button
                                    role="menuitem"
                                    onClick={() => { logout(); setIsOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors group"
                                >
                                    <Icons.Logout className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-bold text-left rtl:text-right">{t('logout')}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group"
                            >
                                <Icons.Dashboard className="w-5 h-5" />
                                <span className="font-bold">{t('login')}</span>
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-accent/50 text-foreground transition-all group"
                            >
                                <Icons.Users className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                <span className="font-bold">{t('signup')}</span>
                            </Link>
                        </div>
                    )}
                </div>
            )} */}
            {isOpen && (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    className={cn(
                        "absolute   mt-3 w-64 bg-background border border-border/50 rounded-3xl shadow-2xl p-2 z-150",
                        "animate-in fade-in zoom-in-95 duration-200",
                        bottom
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {isLoggedIn ? (
                        <>
                            <div className="p-3 border-b border-border/30 mb-1">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.User className="w-4 h-4 text-info" />
                                {t('profile')}
                            </Link>
                            <Link
                                href="/orders"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.Products className="text-success w-5 h-5 hover:text-primary " />
                                {t('orders')}
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors"
                            >
                                <Icons.Logout className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-1">
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20"
                            >
                                {t('login')}
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                {t('signup')}
                            </Link>
                        </div>
                    )}
                </div>
            )}

        </div>


    );
}

/**
 * Internal MenuLink Helper
 */
function MenuLink({ href, icon: Icon, label, onSelect }: { href: string; icon: any; label: string; onSelect: () => void }) {
    return (
        <Link
            href={href}
            role="menuitem"
            onClick={onSelect}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition-colors group"
        >
            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-bold text-foreground">{label}</span>
        </Link>
    );
}
