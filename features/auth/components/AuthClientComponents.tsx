'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { authApi } from '../api';

/**
 * SocialLoginSection — Shared social login buttons + divider.
 * Needs to be a Client Component because of onClick handlers.
 */
export function SocialLoginSection({ dividerText }: { dividerText?: string }) {
  const label = dividerText || 'أو المتابعة عبر';

  return (
    <>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground font-bold tracking-widest">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
          onClick={() => window.location.href = authApi.getGoogleAuthUrl()}
        >
          <Icons.Google className="w-5 h-5 mr-2" />
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          className="h-12 rounded-xl border-border/50 bg-background hover:bg-secondary/50 transition-all font-bold text-foreground/80 hover:text-foreground hover:border-border"
          onClick={() => window.location.href = authApi.getFacebookAuthUrl()}
        >
          <Icons.Facebook className="w-5 h-5 mr-2" />
          Facebook
        </Button>
      </div>
    </>
  );
}

/**
 * PasswordStrength — A visual indicator of password complexity.
 * Needs to be a Client Component because it uses react-hook-form hooks.
 */
export function PasswordStrength({ name }: { name: string }) {
  const { control } = useFormContext();
  const password = useWatch({ control, name });
  
  if (!password) return null;

  const getStrength = (val: string) => {
    let score = 0;
    if (val.length > 6) score++;
    if (val.length > 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const score = getStrength(password);
  const colors = [
    'bg-muted', 
    'bg-destructive', 
    'bg-orange-500', 
    'bg-yellow-500', 
    'bg-blue-500', 
    'bg-emerald-500'
  ];

  return (
    <div className="flex gap-1 h-1 mt-1 px-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <div 
          key={s} 
          className={cn(
            "flex-1 rounded-full transition-all duration-500",
            s <= score ? colors[score] : "bg-muted"
          )} 
        />
      ))}
    </div>
  );
}
