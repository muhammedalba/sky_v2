"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import ErrorMessage from "@/shared/ui/ErrorMessage";
import ImageUpload from "@/shared/ui/form/ImageUpload";
import { authApi } from "@/features/auth/api";
import { profileSchema, type ProfileInput } from "@/features/users/user.schema";
import { queryKeys } from "@/lib/api/query-keys";
import { useToast } from "@/shared/hooks/useToast";
import type { User } from "@/types";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { Input } from "@/shared/ui/Input";
import { MailIcon, PhoneIcon, UserIcon } from "@/shared/ui/Icons";

interface ProfileTabProps {
  user: User;
  avatarUrl: string | null;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  localPreview: string | null;
  setLocalPreview: (preview: string | null) => void;
}

export function ProfileTab({
  user,
  avatarUrl,
  imageFile,
  setImageFile,
  localPreview,
  setLocalPreview,
}: ProfileTabProps) {
  const t = useTranslations("profile");
  const queryClient = useQueryClient();
  const toast = useToast();

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar || null,
      phone: user?.phone ?? undefined,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileInput) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (imageFile instanceof File) {
        formData.append("avatar", imageFile);
      } else if (imageFile === null && localPreview === "") {
        formData.append("avatar", "null");
      }
      return authApi.updateMe(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      setLocalPreview(null);
      setImageFile(null);
      toast.success(t("messages.profileUpdated"));
    },
    onError: (error: AxiosError<{ errors?: string }>) => {
      toast.error(
        error.response?.data?.errors ||
          error.message ||
          "Failed to update profile.",
      );
    },
  });

  return (
    <>
      {/* Personal Details Form */}
      <Card className="w-full border-border/60 bg-card  rounded-2xl lg:col-span-2">
        {/* Avatar Upload Card */}
        <ScrollReveal
          animation="fade"
          className=" flex items-center justify-between flex-col "
        >
          <div className="p-6  border-b border-border/40 w-full bg-accent/70 ">
            <h2 className="text-base font-bold title-gradient">
              {t("avatar.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("avatar.description")}
            </p>
          </div>
          <div className="flex items-start p-4 w-full h-full ">
            <ImageUpload
              value={avatarUrl || undefined}
              loading="eager"
              onChange={(file: File) => {
                setImageFile(file);
                setLocalPreview(URL.createObjectURL(file));
                profileForm.setValue("avatar", file);
              }}
              onRemove={() => {
                setImageFile(null);
                setLocalPreview("");
                profileForm.setValue("avatar", null);
              }}
            />
          </div>
        </ScrollReveal>
        <div className="p-6 bg-accent/70  border-border/40">
          <h2 className="text-lg font-bold title-gradient">
            {t("personalInfo")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("personalInfoDescription")}
          </p>
        </div>

        <form
          onSubmit={profileForm.handleSubmit((data) =>
            updateProfileMutation.mutate(data),
          )}
          className="space-y-6 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div className="space-y-2 pt-2">
              <Input
                label={t("fields.name")}
                type="text"
                icon={UserIcon}
                {...profileForm.register("name")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {profileForm.formState.errors.name && (
                <ErrorMessage
                  message={profileForm.formState.errors.name.message!}
                />
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2 pt-2">
              <Input
              label={t("fields.email")}
                type="email"
                icon={MailIcon}
                {...profileForm.register("email")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {profileForm.formState.errors.email && (
                <ErrorMessage
                  message={profileForm.formState.errors.email.message!}
                />
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2 md:col-span-2 pt-2">
              <Input
                label={t("fields.phone")}
                type="tel"
                icon={PhoneIcon}
                {...profileForm.register("phone")}
                className="w-full h-11 px-4 rounded-xl text-sm outline-none bg-muted/30 border border-border/80 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {profileForm.formState.errors.phone && (
                <ErrorMessage
                  message={profileForm.formState.errors.phone.message!}
                />
              )}
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              isLoading={updateProfileMutation.isPending}
              className="min-w-35 font-bold"
            >
              {t("buttons.saveChanges")}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
