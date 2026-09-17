"use client";

import Link from "next/link";
import type { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import ImageWithFallback from "@/shared/ui/image/ImageWithFallback";
import {
  BellIcon,
  CheckIcon,
  EditIcon,
  LogoutIcon,
  MailIcon,
} from "@/shared/ui/Icons";
import { formatEmail, formatRelativeTime } from "@/lib/utils";
import type { User } from "@/features/users/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

interface AccountHeaderProps {
  user: User;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  avatarUrl: string | null;
  onEditAvatar: () => void;
  onLogout: () => void;
}

export function AccountHeader({
  user,
  locale,
  t,
  avatarUrl,
  onEditAvatar,
  onLogout,
}: AccountHeaderProps) {
  return (
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 sm:p-8  backdrop-blur-md">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
          {/* Avatar block */}
          <div className="relative group">
            <ScrollReveal animation="fade" className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner overflow-hidden">
              {avatarUrl ? (
                <ImageWithFallback
                  src={avatarUrl}
                  alt={user.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  fallback={
                    <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  }
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </ScrollReveal>
            <button
              type="button"
              onClick={onEditAvatar}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-md border-2 border-card hover:scale-110 transition-transform cursor-pointer"
              title={t("tabs.profile")}
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User basic info */}
          <ScrollReveal animation="fade" className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight title-gradient">
                {user?.name || t("guest")}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                <CheckIcon className="w-3 h-3" />
                {user.isActive ? t("status.active") : t("status.inactive")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <MailIcon className="w-4 h-4 shrink-0 text-muted-foreground/60" />
              {user?.email ? formatEmail(user.email) : "user@example.com"}
            </p>
            {user.lastLogin && (
              <p className="text-xs text-muted-foreground/80">
                {t("lastLogin")} {formatRelativeTime(user.lastLogin, locale)}
              </p>
            )}
          </ScrollReveal>
        </div>

        {/* Actions or secondary buttons */}
        <ScrollReveal animation="slide-up" className="flex items-center gap-3">
          <Link href={`/${locale}/notifications`}>
            <button className="h-10 px-4 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-semibold text-sm transition-all flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-warning" />
              {t("notifications")}
            </button>
          </Link>

          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 font-semibold gap-2 text-sm transition-all"
            onClick={onLogout}
          >
            <LogoutIcon className="w-4 h-4 text-destructive" />
            {t("actions.logout")}
          </Button>
        </ScrollReveal>
      </div >
    </div>
  );
}
