"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import Modal from "@/shared/ui/Modal";
import PasswordInput from "@/shared/ui/PasswordInput";
import { ShieldIcon, TrashIcon, WarningIcon } from "@/shared/ui/Icons";
import { useDeleteAccount, useMe } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/shared/hooks/useToast";

/** Level of the default customer role; staff accounts are removed from the dashboard. */
const CUSTOMER_ROLE_LEVEL = 1;

/**
 * "Delete account" danger zone of the Security tab.
 *
 * Email/password accounts confirm with their password; Google/Facebook/Apple
 * accounts have none and confirm with the dialog alone (the API decides the
 * same way, from `provider`). Hidden for staff, whom the API refuses.
 */
export function DeleteAccountSection() {
  const t = useTranslations("profile.deleteAccount");
  const toast = useToast();
  const { data: user } = useMe();
  const deleteAccount = useDeleteAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");

  const roleLevel =
    user && typeof user.role === "object" ? user.role.level : 0;
  if (!user || roleLevel > CUSTOMER_ROLE_LEVEL) return null;

  const needsPassword = !user.provider || user.provider === "auth";

  const close = () => {
    if (deleteAccount.isPending) return;
    setIsOpen(false);
    setPassword("");
  };

  const confirm = () => {
    deleteAccount.mutate(needsPassword ? password : undefined, {
      // The API's message is already translated (wrong password, staff, ...)
      onError: (error) => toast.error(error.message || t("error")),
    });
  };

  return (
    <Card className="border-destructive/30 bg-card shadow-sm rounded-2xl">
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-destructive">{t("title")}</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setIsOpen(true)}
            className="min-w-40 font-bold"
          >
            <TrashIcon />
            {t("button")}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={close}
              disabled={deleteAccount.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirm}
              isLoading={deleteAccount.isPending}
              disabled={needsPassword && !password}
              className="font-bold"
            >
              {t("confirmButton")}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <WarningIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <ul className="text-xs leading-relaxed space-y-1 list-disc ps-4">
              <li>{t("consequences.data")}</li>
              <li>{t("consequences.sessions")}</li>
              <li>{t("consequences.orders")}</li>
            </ul>
          </div>

          {needsPassword && (
            <PasswordInput
              label={t("passwordLabel")}
              icon={ShieldIcon}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showStrength={false}
              autoComplete="current-password"
            />
          )}
        </div>
      </Modal>
    </Card>
  );
}
