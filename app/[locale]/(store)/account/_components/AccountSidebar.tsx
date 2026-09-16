"use client";

import type { useTranslations } from "next-intl";
import {
  DashboardIcon,
  PackageIcon,
  ShieldIcon,
  UserIcon,
} from "@/shared/ui/Icons";
import type { ActiveTabType } from "./types";

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
      className="lg:col-span-3 flex flex-col gap-1.5 bg-card text-card-foreground border border-border/60 rounded-2xl p-4 shadow-sm backdrop-blur-md"
    >
      <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {t("nav.sectionLabel")}
      </p>

      <button
        role="tab"
        id="tab-overview"
        aria-selected={activeTab === "overview"}
        aria-controls="tabpanel-overview"
        onClick={() => onTabChange("overview")}
        className={tabButtonClass(activeTab === "overview")}
      >
        <DashboardIcon className="w-4.5 h-4.5 shrink-0" />
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
        <UserIcon className="w-4.5 h-4.5 shrink-0" />
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
        <PackageIcon className="w-4.5 h-4.5 shrink-0" />
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
        <ShieldIcon className="w-4.5 h-4.5 shrink-0" />
        <span className="flex-1 truncate">{t("tabs.security")}</span>
      </button>
    </aside>
  );
}
