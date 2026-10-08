'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { loginSchema } from '@/features/auth/auth.schema';
import { LoginResponseData } from '@/features/auth/types';
import { checkUserPermission } from '@/lib/auth';
import { Link, useRouter } from '@/navigation';
import { Button } from '@/shared/ui/Button';
import { LockIcon as Lock, MailIcon as Mail } from '@/shared/ui/Icons';
import { SocialLoginSection } from './AuthClientComponents';
import { SmartForm } from '@/shared/ui/form/SmartForm';
import { SmartInput, SmartPasswordInput } from '@/shared/ui/form/SmartFields';
import { useToast } from '@/shared/hooks/useToast';

/**
 * Only same-site paths are allowed as a post-login target — rejects absolute
 * URLs and protocol-relative ones ("//evil.com", "/\evil.com") to prevent an
 * open redirect via ?redirect=. A leading locale is stripped because the
 * locale-aware router adds it back.
 */
function getSafeRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return null;
  }
  return value.replace(/^\/(ar|en)(?=\/|$|\?)/, '') || '/';
}

const subscribeToHistory = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

/**
 * Query string without useSearchParams(): on a statically rendered page,
 * useSearchParams() bails out of prerendering, so the form would be missing
 * from the HTML until JS hydrates. The server snapshot is "" (no query), and
 * the real value is applied right after hydration.
 */
function useLocationSearchParams(): URLSearchParams {
  const search = useSyncExternalStore(
    subscribeToHistory,
    () => window.location.search,
    () => '',
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useLocationSearchParams();
  const t = useTranslations('auth');
  const toast = useToast();

  const loginMutation = useLogin();

  const onSubmit = async (data: { email: string; password: string }) => {
    // useLogin already normalizes the response to LoginResponseData
    const userData: LoginResponseData = await loginMutation.mutateAsync(data);
    toast.success(t('loginSuccess'));
    // Determine redirect based on server-provided role/permissions (no localStorage)
    const canAccessDashboard = checkUserPermission(userData, 'access_dashboard');
    const redirectParam = getSafeRedirect(searchParams.get('redirect'));
    if (redirectParam) {
      router.push(redirectParam);
    } else if (canAccessDashboard) {
      router.push(`/dashboard`);
    } else {
      router.push(`/home`);
    }
  };

  const successMessage =
    searchParams.get('signup') === 'success' ? t('signupSuccess') :
      searchParams.get('reset') === 'success' ? t('resetSuccess') :
      searchParams.get('deleted') === 'success' ? t('accountDeleted') :
       searchParams.get('redirect')==="/checkout" ? t('loginSuccess') :
        null;

  // Logo, header and footer are rendered by the (server) page; this client
  // component only holds the interactive parts. The fragment keeps both
  // children direct descendants of the page's `space-y-6` wrapper.
  return (
    <>
      <SmartForm
        schema={loginSchema}
        defaultValues={{ email: '', password: '' }}
        onSubmit={onSubmit}
        successMessage={successMessage}
        networkErrorMessage={t('serverError')}
      >
        <div className="space-y-4">
          <SmartInput
            name="email"
            label={t('email')}
            icon={Mail}
            type="email"
            disabled={loginMutation.isPending}
            className="h-12"
          />

          <div className="space-y-2">
            <SmartPasswordInput
              name="password"
              label={t('password')}
              icon={Lock}
              disabled={loginMutation.isPending}
              className="h-12"
              showStrength={false}
            />
            <div className="flex justify-end">
              <Link href={`/forgot-password`} className="text-[9px] md:text-xs md:font-semibold text-primary hover:text-primary/80 transition-colors">
                {t('forgotPasswordLink')}
              </Link>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
          isLoading={loginMutation.isPending}
        >
          {t('loginButton')}
        </Button>
      </SmartForm>

      <SocialLoginSection disabled={loginMutation.isPending} />
    </>
  );
}

