"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Icons } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

/**
 * Types & Interfaces
 */
interface PlatformLink {
  id: string;
  brand: string;
  url: string;
  icon: React.ElementType;
  color: {
    text: string;
    bg: string;
    border: string;
    glow: string;
  };
}

interface PlatformGroup {
  id: string;
  icon: React.ElementType;
  platforms: PlatformLink[];
}

/**
 * PlatformCard Component
 * High-end widget-style card with sophisticated hover effects and brand identity.
 */
const PlatformCard = ({ platform, index, isVisible }: { platform: PlatformLink; index: number; isVisible: boolean }) => {
  const t = useTranslations("dashboard.externalPlatforms.links");
  const Icon = platform.icon;

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col h-full p-6 rounded-[24px] border bg-card/40 backdrop-blur-xl transition-all duration-700 overflow-hidden",
        "hover:-translate-y-1 hover:shadow-xl hover:border-primary/20",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-12",
        platform.color.border
      )}
      style={{ 
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-700 z-0 bg-linear-to-br",
        platform.color.glow
      )} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-[18px] shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
              platform.color.bg
            )}>
              <Icon className={cn("w-7 h-7", platform.color.text)} />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full">
                  {platform.brand}
                </span>
              </div>
              <h4 className="text-lg font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors leading-tight mt-1">
                {t(platform.id)}
              </h4>
            </div>
          </div>
          
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary/50 border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <Icons.ExternalLink className="w-4 h-4 text-primary" />
          </div>
        </div>

        <p className="text-[15px] text-muted-foreground leading-relaxed grow font-medium">
          {t(`${platform.id}Desc`)}
        </p>

        {/* Modern Action Bar */}
        <div className="mt-8 pt-5 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[12px] font-bold text-muted-foreground/80 tracking-wide uppercase">
              {platform.brand === "Google" ? "Authenticated" : "Active Service"}
            </span>
          </div>
          <Icons.ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Subtle Inner Highlight */}
      <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-foreground/3 dark:ring-white/5 pointer-events-none z-20" />
    </a>
  );
};

const PlatformSection = ({ group, t }: { group: PlatformGroup; t: any }) => {
  const GroupIcon = group.icon;

  return (
    <ScrollReveal animation="none" className="space-y-10">
      {(isVisible) => (
        <>
          <div className={cn(
            "flex items-center gap-8 transition-all duration-1000 delay-100",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          )}>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border/60 shadow-inner backdrop-blur-sm">
                <GroupIcon className="w-6 h-6 text-warning" />
              </div>
              <h3 className="text-3xl font-black title-gradient tracking-tight">
                {t(`categories.${group.id}`)}
              </h3>
            </div>
            <div className="h-px flex-1 bg-linear-to-r from-border via-border/40 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-10">
            {group.platforms.map((platform, pIdx) => (
              <PlatformCard 
                key={platform.id} 
                platform={platform} 
                index={pIdx}
                isVisible={isVisible}
              />
            ))}
          </div>
        </>
      )}
    </ScrollReveal>
  );
};

export default function ExternalPlatformsCenter() {
  const t = useTranslations("dashboard.externalPlatforms");

  const PLATFORM_GROUPS: PlatformGroup[] = [
    {
      id: "marketingGrowth",
      icon: Icons.AiSpark,
      platforms: [
        {
          id: "googleMerchantCenter",
          brand: "Google",
          url: "https://merchants.google.com/",
          icon: Icons.ShoppingBag,
          color: {
            text: "text-emerald-600 ",
            bg: "bg-muted",
            border: "border ",
            glow: "from-emerald-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "metaBusinessSuite",
          brand: "Meta",
          url: "https://business.facebook.com/",
          icon: Icons.Infinity,
          color: {
            text: "text-blue-600 ",
            bg: "bg-muted",
            border: "border",
            glow: "from-blue-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "tiktokAdsManager",
          brand: "TikTok",
          url: "https://ads.tiktok.com/",
          icon: Icons.TikTokBrand,
          color: {
            text: "text-zinc-900 ",
            bg: "bg-zinc-100 ",
            border: "border",
            glow: "from-zinc-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "snapchatAdsManager",
          brand: "Snapchat",
          url: "https://ads.snapchat.com/",
          icon: Icons.SnapchatBrand,
          color: {
            text: "text-amber-600 ",
            bg: "bg-amber-50 ",
            border: "border",
            glow: "from-amber-500/5 via-transparent to-transparent",
          },
        },
      ],
    },
    {
      id: "analyticsOptimization",
      icon: Icons.BarChart3,
      platforms: [
        {
          id: "googleAnalytics",
          brand: "Google",
          url: "https://analytics.google.com/",
          icon: Icons.BarChart3,
          color: {
            text: "text-orange-600 ",
            bg: "bg-orange-50 ",
            border: "border",
            glow: "from-orange-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "googleTagManager",
          brand: "Google",
          url: "https://tagmanager.google.com/",
          icon: Icons.Tags,
          color: {
            text: "text-indigo-600 ",
            bg: "bg-indigo-50 ",
            border: "border",
            glow: "from-indigo-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "googleSearchConsole",
          brand: "Google",
          url: "https://search.google.com/search-console",
          icon: Icons.Search,
          color: {
            text: "text-blue-500 ",
            bg: "bg-blue-50 ",
            border: "border",
            glow: "from-blue-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "pageSpeedInsights",
          brand: "Web.dev",
          url: "https://pagespeed.web.dev/",
          icon: Icons.Gauge,
          color: {
            text: "text-rose-600 ",
            bg: "bg-rose-50 ",
            border: "border",
            glow: "from-rose-500/5 via-transparent to-transparent",
          },
        },
      ],
    },
    {
      id: "presenceTrust",
      icon: Icons.Shield,
      platforms: [
        {
          id: "googleBusinessProfile",
          brand: "Google",
          url: "https://business.google.com/",
          icon: Icons.Store,
          color: {
            text: "text-sky-600 ",
            bg: "bg-sky-50 ",
            border: "border",
            glow: "from-sky-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "bingWebmasterTools",
          brand: "Microsoft",
          url: "https://www.bing.com/webmasters",
          icon: Icons.Globe,
          color: {
            text: "text-teal-600 ",
            bg: "bg-teal-50 ",
            border: "border",
            glow: "from-teal-500/5 via-transparent to-transparent",
          },
        },
      ],
    },
    {
      id: "technicalInfrastructure",
      icon: Icons.Database,
      platforms: [
        {
          id: "mongoAtlas",
          brand: "MongoDB",
          url: "https://cloud.mongodb.com/",
          icon: Icons.Database,
          color: {
            text: "text-green-600 ",
            bg: "bg-green-50 ",
            border: "border",
            glow: "from-green-500/5 via-transparent to-transparent",
          },
        },
        {
          id: "aivenRedis",
          brand: "Redis",
          url: "https://console.aiven.io/",
          icon: Icons.Database,
          color: {
            text: "text-red-600 ",
            bg: "bg-red-50 ",
            border: "border",
            glow: "from-red-500/5 via-transparent to-transparent",
          },
        },
      ],
    },
  ];

  return (
    <div className="space-y-16 w-full pb-32">
      {/* Premium Header Section */}
      <header className="flex flex-col gap-5 max-w-4xl border-b pb-6">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit animate-in fade-in slide-in-from-left-10 duration-700">
          <Icons.Infinity className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-black text-primary uppercase tracking-[0.2em]">
            Ecosystem Hub
          </span>
        </div>
        
        <div className={cn(
          "space-y-3 transition-all duration-1000 delay-300",
          "animate-in fade-in slide-in-from-bottom-10"
        )}>
          <h2 className="text-2xl font-black tracking-tight title-gradient sm:text-3xl lg:text-4xl">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
            {t("description")}
          </p>
        </div>
      </header>

      {/* Categories & Links */}
      <div className="space-y-24">
        {PLATFORM_GROUPS.map((group) => (
          <PlatformSection key={group.id} group={group} t={t} />
        ))}
      </div>
    </div>
  );
}
