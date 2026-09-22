import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { Switch } from "@/shared/ui/Switch";
import { CreateShippingProviderDto, ShippingProvider } from "../../types";
import {
  useCreateShippingProvider,
  useUpdateShippingProvider,
} from "../../hooks/useShippingProviders";
import { useToast } from "@/shared/hooks/useToast";
import { EditIcon } from "@/shared/ui/Icons";
import ImageUpload from "@/shared/ui/form/ImageUpload";
import { getFileUrl } from "@/shared/utils/image.util";

const getFormSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z.string().min(1, t("form.nameRequired")),
    code: z.string().min(1, t("form.codeRequired")),
    logo: z.any().optional(),
    trackingUrl: z.string().optional(),
    isActive: z.boolean(),
  });

type ShippingProviderFormData = z.infer<ReturnType<typeof getFormSchema>>;

interface ShippingProviderFormProps {
  editingProvider?: ShippingProvider | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShippingProviderForm({
  editingProvider,
  onSuccess,
  onCancel,
}: ShippingProviderFormProps) {
  const t = useTranslations("shipping");
  const tCommon = useTranslations("buttons");
  const { success: toastSuccess, error: toastError } = useToast();
  const formSchema = getFormSchema(t);

  const { mutateAsync: createProvider, isPending: isCreating } =
    useCreateShippingProvider();
  const { mutateAsync: updateProvider, isPending: isUpdating } =
    useUpdateShippingProvider();
  const isPending = isCreating || isUpdating;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    getFileUrl(editingProvider?.logo) || null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ShippingProviderFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingProvider
      ? {
          name: editingProvider.name || "",
          code: editingProvider.code || "",
          logo: getFileUrl(editingProvider.logo) || "",
          trackingUrl: editingProvider.trackingUrl || "",
          isActive: editingProvider.isActive ?? true,
        }
      : {
          name: "",
          code: "",
          logo: null,
          trackingUrl: "",
          isActive: true,
        },
  });

  const isActive = useWatch({ control, name: "isActive" });

  const onSubmit = async (data: CreateShippingProviderDto) => {
    try {
      const payload: CreateShippingProviderDto = {
        name: data.name,
        code: data.code,
        trackingUrl: data.trackingUrl || "",
        isActive: data.isActive,
      };

      if (imageFile) {
        payload.logo = imageFile;
      }

      if (editingProvider) {
        await updateProvider({ id: editingProvider._id, data: payload });
        toastSuccess(t("form.updateSuccess"));
      } else {
        await createProvider(payload);
        toastSuccess(t("form.createSuccess"));
      }
      onSuccess?.();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : t("form.unexpectedError");
      toastError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Input
          label={t("form.nameLabel")}
          icon={EditIcon}
          {...register("name")}
          error={errors.name?.message}
          disabled={isPending}
          dir="rtl"
        />
      </div>

      <div className="space-y-2">
        <Input
          label={t("form.codeLabel")}
          {...register("code")}
          error={errors.code?.message}
          disabled={isPending}
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Input
          label={t("form.trackingUrlLabel")}
          {...register("trackingUrl")}
          error={errors.trackingUrl?.message}
          disabled={isPending}
          dir="ltr"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t("form.trackingUrlHint")}
        </p>
      </div>

      <div className="space-y-2">
        <ImageUpload
          value={imagePreview || undefined}
          onChange={(file) => {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setValue("logo", file, { shouldValidate: true });
          }}
          onRemove={() => {
            setImageFile(null);
            setImagePreview(null);
            setValue("logo", undefined, { shouldValidate: true });
          }}
          error={errors?.logo?.message as string | undefined}
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="space-y-0.5">
          <span className="font-semibold text-base">
            {t("form.activeTitle")}{" "}
          </span>
          <p className="text-sm text-muted-foreground">
            {t("form.activeDescription")}
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={(val) => setValue("isActive", val)}
          disabled={isPending}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20"
          type="submit"
          isLoading={isPending}
          disabled={isPending}
        >
          {editingProvider ? tCommon("save") : tCommon("add")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl px-6 font-bold"
          onClick={onCancel}
          disabled={isPending}
        >
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
