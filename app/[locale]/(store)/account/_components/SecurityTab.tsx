"use client";

import { useTranslations } from "next-intl";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import PasswordInput from "@/shared/ui/PasswordInput";
import { ShieldIcon } from "@/shared/ui/Icons";
import { authApi } from "@/features/auth/api";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/features/users/user.schema";
import { useToast } from "@/shared/hooks/useToast";

export function SecurityTab() {
  const t = useTranslations("profile");
  const toast = useToast();

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", confirmPassword: "" },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => authApi.changePassword(data),
    onSuccess: () => {
      passwordForm.reset();
      toast.success(t("messages.passwordChanged"));
    },
    onError: (error: AxiosError<{ errors?: string }>) => {
      toast.error(
        error.response?.data?.errors ||
          error.message ||
          "Failed to update password.",
      );
    },
  });

  return (
    <Card className="p-6 border-border/60 bg-card shadow-sm rounded-2xl">
      <div className="pb-4 mb-6 border-b border-border/40">
        <h2 className="text-lg font-bold text-foreground">
          {t("changePassword")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("changePasswordDescription")}
        </p>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-3.5 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
        <ShieldIcon className="w-4 h-4 mt-0.5 shrink-0" />
        <p className="text-xs leading-relaxed">
          {t("passwordSecurityNote")}
        </p>
      </div>

      <FormProvider {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit((data) =>
            changePasswordMutation.mutate(data),
          )}
          className="space-y-5"
        >
          {/* current Password */}
          <PasswordInput
            {...passwordForm.register("currentPassword")}
            label={t("fields.currentPassword")}
            icon={ShieldIcon}
            error={passwordForm.formState.errors.currentPassword?.message}
          />
          {/* New Password */}
          <PasswordInput
            {...passwordForm.register("password")}
            label={t("fields.newPassword")}
            icon={ShieldIcon}
            error={passwordForm.formState.errors.password?.message}
          />
          {/* Confirm Password */}
          <PasswordInput
            {...passwordForm.register("confirmPassword")}
            label={t("fields.confirmPassword")}
            icon={ShieldIcon}
            error={passwordForm.formState.errors.confirmPassword?.message}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={changePasswordMutation.isPending}
              className="min-w-40 font-bold"
            >
              {t("buttons.updatePassword")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
}
