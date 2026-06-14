"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/ui/Card";
import { Switch } from "@/shared/ui/Switch";
import { OrdersIcon } from "@/shared/ui/Icons";
import { SettingsInput } from "../../settings.schema";

export default function PaymentsSection() {
  const t = useTranslations("settings");
  const { setValue, control } = useFormContext<SettingsInput>();

  const paymentsEnabled = useWatch({ control, name: "paymentsEnabled" });

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <OrdersIcon className="w-5 h-5 text-warning" /> {t("payments.title")}
        </CardTitle>
        <CardDescription>{t("payments.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <OrdersIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-medium block">Enable Online Payments</span>
              <span className="text-sm text-muted-foreground block">Allow users to pay online using the configured payment methods.</span>
            </div>
          </div>
          <Switch
            checked={!!paymentsEnabled}
            onCheckedChange={(checked) =>
              setValue("paymentsEnabled", checked, {
                shouldDirty: true,
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
