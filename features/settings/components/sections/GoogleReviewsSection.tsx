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
import { Input } from "@/shared/ui/Input";
import { ExternalLinkIcon, GoogleIcon, KeyIcon, StarIcon } from "@/shared/ui/Icons";
import { SettingsInput } from "../../settings.schema";
import { useSettings } from "../../hooks/useSettings";

const PLACE_ID_FINDER_URL =
  "https://developers.google.com/maps/documentation/places/web-service/place-id";

export default function GoogleReviewsSection() {
  const t = useTranslations("settings");
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<SettingsInput>();
  const { data: settings } = useSettings();

  const enabled = useWatch({ control, name: "googleReviews.enabled" });
  // The API key is write-only: the server only tells us whether one is stored.
  const hasSavedKey = !!(
    settings as { hasGooglePlacesApiKey?: boolean } | undefined
  )?.hasGooglePlacesApiKey;

  return (
    <Card className="border-border/50 shadow-xs rounded-3xl overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50">
        <CardTitle className="text-xl flex items-center gap-2 title-gradient">
          <GoogleIcon className="w-5 h-5" /> {t("googleReviews.title")}
        </CardTitle>
        <CardDescription>{t("googleReviews.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 border border-border/50 rounded-2xl hover:bg-muted/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-sm">{t("googleReviews.enable")}</p>
              <p className="text-[10px] text-muted-foreground">
                {t("googleReviews.enableDesc")}
              </p>
            </div>
          </div>
          <Switch
            checked={!!enabled}
            onCheckedChange={(checked) =>
              setValue("googleReviews.enabled", checked, { shouldDirty: true })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Input
              {...register("googleReviews.reviewsUrl")}
              label={t("googleReviews.reviewsUrl")}
              placeholder="https://maps.app.goo.gl/..."
              dir="ltr"
              error={errors.googleReviews?.reviewsUrl?.message}
              className="rounded-xl h-11"
            />
            <p className="text-[11px] text-muted-foreground">
              {t("googleReviews.reviewsUrlDesc")}
            </p>
          </div>
          <div className="space-y-1.5">
            <Input
              {...register("googleReviews.placeId")}
              label={t("googleReviews.placeId")}
              placeholder="ChIJ..."
              dir="ltr"
              error={errors.googleReviews?.placeId?.message}
              className="rounded-xl h-11"
            />
            <a
              href={PLACE_ID_FINDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              {t("googleReviews.placeIdHelp")}
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 space-y-2">
          <h4 className="font-bold text-sm flex items-center gap-2">
            <KeyIcon className="w-4 h-4 text-primary" />
            {t("googleReviews.apiKey")}
          </h4>
          <Input
            {...register("googlePlacesApiKey")}
            type="password"
            autoComplete="off"
            label="Google Places API Key"
            placeholder="AIza..."
            dir="ltr"
            error={errors.googlePlacesApiKey?.message}
            className="rounded-xl h-11"
          />
          <p className="text-[11px] text-muted-foreground">
            {hasSavedKey
              ? t("googleReviews.apiKeySaved")
              : t("googleReviews.apiKeyDesc")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
