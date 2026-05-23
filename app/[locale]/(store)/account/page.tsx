"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { BellIcon, CheckIcon, ChevronRightIcon, DashboardIcon, EditIcon, HomeIcon, LogoutIcon, MailIcon, PackageIcon, PlusIcon, RefreshCwIcon, ShieldIcon, ShoppingCartIcon, SpinnerIcon, StarIcon, TrashIcon, UserIcon } from "@/shared/ui/Icons";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatEmail } from "@/lib/utils";
import { redirect } from "next/navigation";

type ActiveTabType = "overview" | "profile" | "addresses" | "security";

export default function AccountPage() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTabType>("overview");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  //if user is not logged in redirect to login page
  if (!user) {
    redirect(`/${locale}/login`);
  }
  // Mock data
  const mockOrders = [
    { id: "#SG-9842", date: "2024-05-01", total: 450, status: "delivered" },
    { id: "#SG-9721", date: "2024-04-15", total: 1200, status: "processing" },
  ];

  const stats = [
    {
      label: t("stats.total_orders"),
      value: "12",
      icon: ShoppingCartIcon,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      label: t("stats.active_orders"),
      value: "1",
      icon: RefreshCwIcon,
      color:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      label: t("stats.saved_items"),
      value: "5",
      icon: StarIcon || HomeIcon,
      color:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  const mockAddresses = [
    {
      id: 1,
      name: user?.name || "User Name",
      type: locale === "ar" ? "المنزل (الافتراضي)" : "Home (Default)",
      details: "King Fahd Road, Al Olaya District",
      city: "Riyadh, Saudi Arabia",
      phone: "+966 50 123 4567",
    },
    {
      id: 2,
      name: user?.name || "User Name",
      type: locale === "ar" ? "العمل" : "Office",
      details: "Tahlia Street, Al Sulaimaniyah District",
      city: "Riyadh, Saudi Arabia",
      phone: "+966 50 765 4321",
    },
  ];

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => setIsSavingProfile(false), 800);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setTimeout(() => setIsSavingPassword(false), 800);
  };

  // Animation variants
  const tabVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25 } },
  };

  return (
    <div className="min-h-screen pt-36 pb-20 bg-background text-foreground transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header summary panel */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm backdrop-blur-md">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-start">
              {/* Avatar block */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-3xl sm:text-4xl font-black shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-md border-2 border-card hover:scale-110 transition-transform">
                  <EditIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* User basic info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {user?.name || (locale === "ar" ? "ضيف" : "Guest")}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckIcon className="w-3 h-3" />
                    {locale === "ar" ? "حساب موثق" : "Verified"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <MailIcon className="w-4 h-4 shrink-0 text-muted-foreground/60" />
                  {user?.email ? formatEmail(user.email) : "user@example.com"}
                </p>
              </div>
            </div>

            {/* Actions or secondary buttons */}
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/notifications`}>
                <button className="h-10 px-4 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-semibold text-sm transition-all flex items-center gap-2">
                  <BellIcon className="w-4 h-4" />
                  {locale === "ar" ? "الإشعارات" : "Notifications"}
                </button>
              </Link>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 font-semibold gap-2 text-sm transition-all"
                onClick={() => logout()}
              >
                <LogoutIcon className="w-4 h-4" />
                {t("actions.logout")}
              </Button>
            </div>
          </div>
        </div>

        {/* Grid structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-3 flex flex-col gap-1.5 bg-card text-card-foreground border border-border/60 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {locale === "ar" ? "القائمة" : "Navigation"}
            </p>

            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-start ${
                activeTab === "overview"
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <DashboardIcon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 truncate">
                {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-start ${
                activeTab === "profile"
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <UserIcon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 truncate">{t("tabs.profile")}</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-start ${
                activeTab === "addresses"
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <HomeIcon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 truncate">{t("tabs.addresses")}</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-start ${
                activeTab === "security"
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <ShieldIcon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1 truncate">{t("tabs.security")}</span>
            </button>
          </aside>

          {/* Right Content Panel */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {stats.map((stat, i) => (
                      <Card
                        key={i}
                        className="p-6 border-border/60 bg-card/65 backdrop-blur-md rounded-2xl flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            {stat.label}
                          </p>
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.color}`}
                          >
                            <stat.icon className="w-4.5 h-4.5" />
                          </div>
                        </div>
                        <p className="text-3xl font-black text-foreground">
                          {stat.value}
                        </p>
                      </Card>
                    ))}
                  </div>

                  {/* Recent Orders section */}
                  <Card className="p-6 border-border/60 bg-card shadow-sm rounded-2xl space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/40">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">
                          {t("sections.recent_orders")}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {locale === "ar"
                            ? "تتبع حالة طلباتك الأخيرة والسابقة"
                            : "Track your active and historical orders"}
                        </p>
                      </div>
                      <Link href={`/${locale}/account/orders`}>
                        <Button
                          variant="ghost"
                          className="font-semibold text-primary hover:text-primary/90 text-sm gap-1"
                        >
                          {t("actions.view_all_orders")}
                          <ChevronRightIcon className="w-4 h-4 rtl:rotate-180" />
                        </Button>
                      </Link>
                    </div>

                    <div className="divide-y divide-border/40">
                      {mockOrders.map((order, i) => (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground border border-border">
                              <PackageIcon className="w-5 h-5 text-muted-foreground/80" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-foreground">
                                {order.id}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {order.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-end">
                            <div>
                              <p className="font-extrabold text-sm text-foreground">
                                {order.total} SAR
                              </p>
                              <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">
                                {locale === "ar" ? "المجموع" : "Total Price"}
                              </p>
                            </div>
                            <div
                              className={`px-2.5 py-1 rounded-lg font-semibold text-xs uppercase tracking-wide border ${
                                order.status === "delivered"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              }`}
                            >
                              {order.status}
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-muted-foreground/30 rtl:rotate-180 hidden sm:block" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* TAB 2: PROFILE */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card className="p-6 border-border/60 bg-card shadow-sm rounded-2xl">
                    <div className="pb-4 mb-6 border-b border-border/40">
                      <h2 className="text-lg font-bold text-foreground">
                        {t("personalInfo")}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {t("personalInfoDescription")}
                      </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            {t("fields.name")}
                          </label>
                          <input
                            type="text"
                            defaultValue={user?.name || ""}
                            required
                            className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            {t("fields.email")}
                          </label>
                          <input
                            type="email"
                            defaultValue={user?.email || ""}
                            required
                            className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            {t("fields.phone")}
                          </label>
                          <input
                            type="tel"
                            defaultValue="+966 50 123 4567"
                            className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSavingProfile}
                          className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all flex items-center gap-2"
                        >
                          {isSavingProfile && (
                            <SpinnerIcon className="w-4 h-4 text-primary-foreground" />
                          )}
                          {t("buttons.saveChanges")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {/* TAB 3: ADDRESSES */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-border/40">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">
                        {t("sections.address_book")}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {locale === "ar"
                          ? "إدارة مواقع وعناوين التوصيل الخاصة بك"
                          : "Manage your primary e-commerce shipping addresses"}
                      </p>
                    </div>
                    <Button className="h-9 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 text-xs gap-1.5">
                      <PlusIcon className="w-4 h-4" />
                      {t("actions.add_address")}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {mockAddresses.map((address) => (
                      <Card
                        key={address.id}
                        className="p-5 border-border/60 bg-card rounded-2xl shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                              {address.type}
                            </span>
                            <div className="flex items-center gap-1">
                              <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                                <EditIcon className="w-3.5 h-3.5" />
                              </button>
                              <button className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all">
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">
                              {address.name}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {address.details}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {address.city}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-border/40 flex items-center gap-2 text-xs text-muted-foreground">
                          <MailIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{address.phone}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SECURITY */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  variants={tabVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card className="p-6 border-border/60 bg-card shadow-sm rounded-2xl">
                    <div className="pb-4 mb-6 border-b border-border/40">
                      <h2 className="text-lg font-bold text-foreground">
                        {t("changePassword")}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {t("changePasswordDescription")}
                      </p>
                    </div>

                    <form onSubmit={handleSavePassword} className="space-y-6">
                      <div className="space-y-4">
                        {/* New Password Field */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            {t("fields.newPassword")}
                          </label>
                          <input
                            type="password"
                            required
                            className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground">
                            {t("fields.confirmPassword")}
                          </label>
                          <input
                            type="password"
                            required
                            className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
                        <p className="font-semibold mb-1 flex items-center gap-1.5">
                          <ShieldIcon className="w-4 h-4 shrink-0" />
                          {locale === "ar" ? "نصيحة أمان مهمة" : "Security Tip"}
                        </p>
                        {t("passwordSecurityNote")}
                      </div>

                      <div className="pt-3 flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSavingPassword}
                          className="h-11 px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all flex items-center gap-2"
                        >
                          {isSavingPassword && (
                            <SpinnerIcon className="w-4 h-4 text-primary-foreground" />
                          )}
                          {t("buttons.updatePassword")}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
