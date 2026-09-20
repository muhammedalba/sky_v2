"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Select } from "@/shared/ui/Select";
import { Card } from "@/shared/ui/Card";
import { CheckIcon, SpinnerIcon, TagIcon } from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { useToast } from "@/shared/hooks/useToast";
import { contactApi } from "@/features/contact/api";

const INQUIRY_TYPES = [
  "general",
  "product",
  "service_quote",
  "complaint",
] as const;

type ContactForm = z.infer<ReturnType<typeof buildContactSchema>>;

function buildContactSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, { message: t("form.errors.nameMin") }),
    email: z.string().email({ message: t("form.errors.emailInvalid") }),
    phone: z.string().min(8, { message: t("form.errors.phoneMin") }),
    inquiryType: z.enum(INQUIRY_TYPES, {
      message: t("form.errors.inquiryTypeRequired"),
    }),
    message: z.string().min(10, { message: t("form.errors.messageMin") }),
  });
}

/**
 * Client-only island: holds the interactive contact form.
 * Kept separate from the (server-rendered) page shell so the
 * react-hook-form/zod bundle isn't shipped for the static hero,
 * info cards, and map sections.
 */
export default function ContactClient() {
  const t = useTranslations("contact");
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const contactSchema = useMemo(() => buildContactSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      await contactApi.send(data);
      setSuccess(true);
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("form.error");
      toast.error(message);
    }
  };

  return (
    <Card className=" border-border/60 bg-card rounded-3xl shadow-sm backdrop-blur-md relative overflow-hidden h-full">
      {success ? (
        <ScrollReveal
          key="success"
          animation="fade"
          duration={300}
          className="flex flex-col items-center justify-center text-center py-12 p-6 sm:p-8 lg:p-10"
        >
          <div className="relative w-15 h-15 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
            <div className="relative w-15 h-15 bg-success/80 text-success-foreground border border-success rounded-full flex items-center justify-center shadow-lg">
              <CheckIcon className="w-10 h-10" />
            </div>
          </div>
          <h3 className="text-2xl font-bold title-gradient mb-2">
            {t("form.success")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {t("form.successMessage")}
          </p>
          <Button
            variant="outline"
            className="mt-8 h-10 px-5 rounded-xl font-semibold border-border hover:bg-muted transition-all"
            onClick={() => setSuccess(false)}
          >
            {t("form.sendAnother")}
          </Button>
        </ScrollReveal>
      ) : (
        <ScrollReveal key="form" animation="fade" duration={300}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
            <div className=" border-b border-border/40 bg-accent/50 rounded-t-2xl p-3 sm:p-4 lg:p-6">
              <h2 className="text-lg font-bold title-gradient">
                {t("form.heading")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("form.subheading")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 sm:p-8 lg:p-10">
              {/* Name field */}
              <div className="space-y-2">
                <Input
                  label={t("form.name")}
                  className={`h-11 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm ${errors.name ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                  placeholder="John Doe"
                  {...register("name")}
                  error={errors.name?.message}
                />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Input
                  label={t("form.email")}
                  className={`h-11 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm ${errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                  placeholder="john@example.com"
                  {...register("email")}
                  error={errors.email?.message}
                />
              </div>

              {/* Phone field */}
              <div className="space-y-2">
                <Input
                  type="tel"
                  label={t("form.phone")}
                  className={`h-11 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm ${errors.phone ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                  placeholder="+963 9xx xxx xxx"
                  {...register("phone")}
                  error={errors.phone?.message}
                />
              </div>

              {/* Inquiry type field */}
              <div className="space-y-2">
                <Select
                  icon={TagIcon}
                  label={t("form.inquiryTypePlaceholder")}
                  error={errors.inquiryType?.message}
                  className={`h-11 [&>select]:h-11 [&>select]:bg-muted/30 [&>select]:border-border/80 [&>select]:focus:ring-primary/10 [&>select]:rounded-xl [&>select]:text-sm ${errors.inquiryType ? "[&>select]:border-destructive" : ""}`}
                  options={INQUIRY_TYPES.map((value) => ({
                    value,
                    label: t(`form.inquiryTypes.${value}`),
                  }))}
                  {...register("inquiryType")}
                />
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-2 px-6 sm:px-8 lg:px-10">
              <Textarea
                label={t("form.message")}
                className={`min-h-40 bg-muted/30 border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all rounded-xl text-sm p-4 resize-none ${errors.message ? "border-destructive focus:border-destructive focus:ring-destructive/10" : ""}`}
                placeholder={t("form.messagePlaceholder")}
                {...register("message")}
                error={errors.message?.message}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-[90%] mx-auto my-5  h-12 text-sm font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <SpinnerIcon className="w-4 h-4 text-primary-foreground" />
              )}
              {isSubmitting ? t("form.submitting") : t("form.submit")}
            </Button>
          </form>
        </ScrollReveal>
      )}
    </Card>
  );
}
