'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/utils';

interface FormStickyHeaderProps {
  title: string;
  subtitle: string;
  cancelLabel: string;
  saveLabel: string;
  formId: string;
  isSubmitting: boolean;
  backUrl: string;
  className?: string;
}

export default function FormStickyHeader({
  title,
  subtitle,
  cancelLabel,
  saveLabel,
  formId,
  isSubmitting,
  backUrl,
  className
}: FormStickyHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn(
      "sticky top-16 z-20 bg-background/90 backdrop-blur-md px-3 pb-4 pt-6 border-b border-border/40 flex flex-wrap items-center justify-between gap-4",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight title-gradient">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl font-bold"
          onClick={() => router.push(backUrl)}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          form={formId}
          className="rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
          isLoading={isSubmitting}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
