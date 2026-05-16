'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/lib/utils';
import { getUser, isAuthenticated, logout } from '@/lib/auth';
import ImageWithFallback from '@/shared/ui/image/ImageWithFallback';
import { User } from '@/types';
import LogoutButton from './topbar/LogoutButton';

interface UserAccountMenuProps {
    iconOnly?: boolean;
    dir?: string;
    className?: string;
    locale: string;
}

const UserAccountMenu = ({ iconOnly = false, dir = "bottom", className = "m-4", locale }: UserAccountMenuProps) => {
    const t = useTranslations('store.nav');
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 1. Memoize the class string calculation
    const bottomClass = useMemo(() => dir === "top" ? " inset-e-0 top-full" : " inset-s-0 bottom-full", [dir]);

    // Initialize auth state on mount
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = isAuthenticated();
            setIsLoggedIn(authStatus);
            // 2. Only fetch user data if authenticated to save resources
            if (authStatus) {
                setUser(getUser());
            } else {
                setUser(null);
            }
        };
        checkAuth();

        window.addEventListener('auth-change', checkAuth);
        return () => window.removeEventListener('auth-change', checkAuth);
    }, []);

    // 3. Memoize handlers to prevent unnecessary re-creations
    const toggleMenu = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => setIsOpen(false), []);
    const stopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);
    
    const handleLogout = useCallback(() => {
        logout();
        closeMenu();
    }, [closeMenu]);

    // Handle interactions: Click outside and Keyboard (Escape)
    useEffect(() => {
        if (!isOpen) return; // Only attach listeners when menu is open

        const handleEvents = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent && e.key === 'Escape') {
                closeMenu();
            }
            if (e instanceof MouseEvent && menuRef.current && !menuRef.current.contains(e.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleEvents);
        document.addEventListener('keydown', handleEvents);
        return () => {
            document.removeEventListener('mousedown', handleEvents);
            document.removeEventListener('keydown', handleEvents);
        };
    }, [isOpen, closeMenu]);

    return (
        <div ref={menuRef} className={cn(iconOnly ? "bg-transparent m-4 relative" : "relative flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50  m-3 p-2 shadow-sm hover:border-primary/30 transition-colors group", className)}>
            {/* Trigger Button */}
            <button
                onClick={toggleMenu}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label={isLoggedIn ? `User menu for ${user?.name}` : "User account menu"}
                className={cn(
                    "relative flex items-center justify-center h-11 w-11 rounded-full border-2 transition-all duration-300",
                    "hover:border-primary active:scale-95 ",
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
            
            {!iconOnly && <div className="flex-1 flex justify-between items-center gap-3">
                <div className=" relative flex flex-col min-w-0">
                    <div className="absolute inset-e-1/3  bottom-1 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-bold truncate text-foreground leading-tight">{user?.name || 'login please'}</span>
                    <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-wider">
                        {typeof user?.role === 'object' ? user.role.name : (user?.role || 'offline')}
                    </span>
                </div>
                {isLoggedIn && <LogoutButton iconOnly={true} />}
            </div>}
            
            {isOpen && (
                <div
                    role="menu"
                    aria-orientation="vertical"
                    className={cn(
                        "absolute overflow-y-hidden  mt-3 w-64 bg-background border border-border/50 rounded-3xl shadow-2xl  z-150",
                        "animate-in fade-in zoom-in-95 duration-200",
                        bottomClass
                    )}
                    onClick={stopPropagation}
                >
                    {isLoggedIn ? (
                        <>
                            <div className="p-3 border-b border-border/30 mb-1 bg-muted/50 ">
                                <p className="text-sm font-bold truncate title-gradient">{user?.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <Link
                                href={`/${locale}/profile`}
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.User className="w-4 h-4 text-info" />
                                {t('profile')}
                            </Link>
                            <Link
                                href={`/${locale}/orders`}
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.Products className="text-success w-5 h-5 hover:text-primary " />
                                {t('orders')}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-sm font-medium text-destructive transition-colors"
                            >
                                <Icons.Logout className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <div className="p-1 ">
                            <Link
                                href={`/${locale}/signup`}
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.User className="w-4 h-4 text-info" />
                               {t('signup')}
                            </Link>
                            <Link
                                href={`/${locale}/login`}
                                onClick={closeMenu}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent/50 text-sm font-medium transition-colors"
                            >
                                <Icons.Users className="text-success w-5 h-5 hover:text-primary " />
                                {t('login')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// 4. Exporting with React.memo
export default memo(UserAccountMenu);