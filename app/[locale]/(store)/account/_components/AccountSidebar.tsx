"use client";

import type { useTranslations } from "next-intl";
import {
  DashboardIcon,
  PackageIcon,
  ShieldIcon,
  UserIcon,
} from "@/shared/ui/Icons";
import type { ActiveTabType } from "./types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

interface AccountSidebarProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  t: ReturnType<typeof useTranslations>;
}

const tabButtonClass = (active: boolean) =>
  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-start cursor-pointer ${
    active
      ? "bg-primary/10 text-primary border-s-4 border-primary"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  }`;

export function AccountSidebar({
  activeTab,
  onTabChange,
  t,
}: AccountSidebarProps) {
  return (
    <aside
      role="tablist"
      aria-label={t("nav.ariaLabel")}
      className="lg:col-span-3 flex flex-col gap-1.5 bg-card text-card-foreground border border-border/60 rounded-2xl backdrop-blur-md"
    >
      <ScrollReveal
        animation="fade"
         delay={300}
        className="bg-accent/70 px-3 pt-3 pb-3 rounded-t-2xl"
      >
        <p className=" text-[14px] font-bold  uppercase tracking-widest title-gradient ">
          {t("nav.sectionLabel")}
        </p>
      </ScrollReveal>
      <ScrollReveal
        animation="slide-left"
        delay={400}
        className=" px-3 pt-3 pb-3 flex flex-col gap-1"
      >
        <button
          role="tab"
          id="tab-overview"
          aria-selected={activeTab === "overview"}
          aria-controls="tabpanel-overview"
          onClick={() => onTabChange("overview")}
          className={tabButtonClass(activeTab === "overview")}
        >
          <DashboardIcon className="w-4.5 h-4.5 shrink-0 text-primary" />
          <span className="flex-1 truncate">{t("nav.dashboard")}</span>
        </button>

        <button
          role="tab"
          id="tab-profile"
          aria-selected={activeTab === "profile"}
          aria-controls="tabpanel-profile"
          onClick={() => onTabChange("profile")}
          className={tabButtonClass(activeTab === "profile")}
        >
          <UserIcon className="w-4.5 h-4.5 shrink-0 text-destructive" />
          <span className="flex-1 truncate">{t("tabs.profile")}</span>
        </button>

        <button
          role="tab"
          id="tab-orders"
          aria-selected={activeTab === "orders"}
          aria-controls="tabpanel-orders"
          onClick={() => onTabChange("orders")}
          className={tabButtonClass(activeTab === "orders")}
        >
          <PackageIcon className="w-4.5 h-4.5 shrink-0 text-warning" />
          <span className="flex-1 truncate">{t("tabs.orders")}</span>
        </button>

        <button
          role="tab"
          id="tab-security"
          aria-selected={activeTab === "security"}
          aria-controls="tabpanel-security"
          onClick={() => onTabChange("security")}
          className={tabButtonClass(activeTab === "security")}
        >
          <ShieldIcon className="w-4.5 h-4.5 shrink-0 text-success" />
          <span className="flex-1 truncate">{t("tabs.security")}</span>
        </button>
      </ScrollReveal>
    </aside>
  );
}
