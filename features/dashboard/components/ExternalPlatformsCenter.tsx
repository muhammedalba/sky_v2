"use client";

import React from "react";
import { Icons } from "@/shared/ui/Icons";
import { useTranslations } from "next-intl";

// Types
interface PlatformLink {
  title: string;
  url: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface PlatformCategory {
  category: string;
  links: PlatformLink[];
}

export default function ExternalPlatformsCenter() {
  const t = useTranslations("dashboard.externalPlatforms");

  const PLATFORM_DATA: PlatformCategory[] = [
    {
      category: t("categories.seoWebmasters"),
      links: [
        {
          title: t("links.googleSearchConsole"),
          url: "https://search.google.com/search-console",
          desc: t("links.googleSearchConsoleDesc"),
          icon: Icons.Search,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: t("links.bingWebmasterTools"),
          url: "https://www.bing.com/webmasters",
          desc: t("links.bingWebmasterToolsDesc"),
          icon: Icons.Globe,
          iconColor: "text-teal-600 dark:text-teal-400",
          iconBg: "bg-teal-100 dark:bg-teal-900/30",
        },
      ],
    },
    {
      category: t("categories.analyticsTracking"),
      links: [
        {
          title: t("links.googleAnalytics"),
          url: "https://analytics.google.com/",
          desc: t("links.googleAnalyticsDesc"),
          icon: Icons.BarChart3,
          iconColor: "text-orange-600 dark:text-orange-400",
          iconBg: "bg-orange-100 dark:bg-orange-900/30",
        },
        {
          title: t("links.googleTagManager"),
          url: "https://tagmanager.google.com/",
          desc: t("links.googleTagManagerDesc"),
          icon: Icons.Tags,
          iconColor: "text-indigo-600 dark:text-indigo-400",
          iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
        },
      ],
    },
    {
      category: t("categories.adsEcommerce"),
      links: [
        {
          title: t("links.googleMerchantCenter"),
          url: "https://merchants.google.com/",
          desc: t("links.googleMerchantCenterDesc"),
          icon: Icons.ShoppingBag,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
          title: t("links.metaBusinessSuite"),
          url: "https://business.facebook.com/",
          desc: t("links.metaBusinessSuiteDesc"),
          icon: Icons.MetaBrand,
          iconColor: "text-blue-700 dark:text-blue-500",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: t("links.tiktokAdsManager"),
          url: "https://ads.tiktok.com/",
          desc: t("links.tiktokAdsManagerDesc"),
          icon: Icons.TikTokBrand,
          iconColor: "text-zinc-900 dark:text-white",
          iconBg: "bg-zinc-100 dark:bg-zinc-800/50",
        },
        {
          title: t("links.snapchatAdsManager"),
          url: "https://ads.snapchat.com/",
          desc: t("links.snapchatAdsManagerDesc"),
          icon: Icons.SnapchatBrand,
          iconColor: "text-yellow-500",
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        },
      ],
    },
    {
      category: t("categories.performanceTrust"),
      links: [
        {
          title: t("links.pageSpeedInsights"),
          url: "https://pagespeed.web.dev/",
          desc: t("links.pageSpeedInsightsDesc"),
          icon: Icons.Gauge,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/30",
        },
        {
          title: t("links.googleBusinessProfile"),
          url: "https://business.google.com/",
          desc: t("links.googleBusinessProfileDesc"),
          icon: Icons.Store,
          iconColor: "text-sky-600 dark:text-sky-400",
          iconBg: "bg-sky-100 dark:bg-sky-900/30",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="space-y-8">
        {PLATFORM_DATA.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
              {section.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.links.map((link, linkIdx) => {
                const Icon = link.icon;

                return (
                  <a
                    key={linkIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border/80"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${link.iconBg}`}
                      >
                        <Icon className={`w-5 h-5 ${link.iconColor}`} />
                      </div>

                      <Icons.ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:text-foreground" />
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {link.desc}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
