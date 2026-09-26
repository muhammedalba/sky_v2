import { getTranslations } from "next-intl/server";
import LoginForm from "@/features/auth/components/LoginForm";
import AuthPageLayout from "@/features/auth/components/AuthPageLayout";
import {
  AuthFooter,
  AuthHeader,
  AuthMobileLogo,
} from "@/features/auth/components/AuthSharedComponents";

// Metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
    // Utility page — no SEO value, and indexing it is actively undesirable.
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <AuthPageLayout
      type="login"
      locale={locale}
      bgColors={{
        top: "bg-gradient-to-br from-primary/30 to-secondary/20",
        bottom: "bg-gradient-to-tl from-secondary/30 to-primary/20",
      }}
    >
      {/* Static parts render on the server; LoginForm holds only the interactive form */}
      <div className="w-full space-y-6">
        <AuthMobileLogo subtitle={t("constructionPortal")} className="lg:hidden" />
        <AuthHeader title={t("loginTitle")} description={t("welcomeBack")} />
        <LoginForm />
        <AuthFooter text={t("noAccount")} linkText={t("signupLink")} linkHref="/signup" />
      </div>
    </AuthPageLayout>
  );
}
