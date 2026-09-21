"use client";

import { useTranslations } from "next-intl";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Card } from "@/shared/ui/Card";
import {
  CheckIcon,
  ChevronRightIcon,
  PlusIcon,
  ShieldIcon,
  XIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  SpinnerIcon,
  ClockIcon,
  UsersIcon,
} from "@/shared/ui/Icons";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";
import { useToast } from "@/shared/hooks/useToast";
import {
  quoteRequestApi,
  type QuoteRequestPayload,
} from "@/features/quote-request/api";

const customerTypes = ["individual", "company"] as const;
const contactMethods = ["phone", "email"] as const;

type QuoteForm = z.infer<ReturnType<typeof buildQuoteSchema>>;

function buildQuoteSchema(t: (key: string) => string) {
  return z
    .object({
      customerType: z.enum(customerTypes),
      name: z.string().min(2, { message: t("form.errors.nameMin") }),
      phone: z.string().min(8, { message: t("form.errors.phoneInvalid") }),
      emails: z
        .array(z.string().email({ message: t("form.errors.emailInvalid") }))
        .min(1, { message: t("form.errors.emailsRequired") }),
      preferredContactMethod: z.enum(contactMethods),
      orderDetails: z
        .string()
        .min(10, { message: t("form.errors.orderDetailsMin") }),
      deliveryAddress: z
        .string()
        .min(10, { message: t("form.errors.deliveryAddressMin") }),
      commercialRegistrationNumber: z.string().optional(),
      taxNumber: z.string().optional(),
      nationalAddress: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.customerType !== "company") return;
      if (
        !data.commercialRegistrationNumber ||
        data.commercialRegistrationNumber.trim().length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["commercialRegistrationNumber"],
          message: t("form.errors.crRequired"),
        });
      }
      if (!data.taxNumber || data.taxNumber.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxNumber"],
          message: t("form.errors.taxRequired"),
        });
      }
      if (!data.nationalAddress || data.nationalAddress.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nationalAddress"],
          message: t("form.errors.nationalAddressRequired"),
        });
      }
    });
}

/**
 * Client-only island: holds the interactive quote request form.
 * Kept separate from the (server-rendered) page shell so the
 * react-hook-form/zod bundle isn't shipped for the static hero
 * and side info sections.
 */
export default function QuoteFormClient() {
  const t = useTranslations("quote");
  const toast = useToast();
  const [success, setSuccess] = useState(false);
  const quoteSchema = useMemo(() => buildQuoteSchema(t), [t]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QuoteForm>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerType: "individual",
      emails: [""],
      preferredContactMethod: "phone",
    },
  });

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: "emails" as never,
  });

  const customerType = useWatch({ control, name: "customerType" });
  const preferredContactMethod = useWatch({
    control,
    name: "preferredContactMethod",
  });
  const isCompany = customerType === "company";

  const onSubmit = async (data: QuoteForm) => {
    try {
      const payload: QuoteRequestPayload = {
        customerType: data.customerType,
        name: data.name,
        phone: data.phone,
        emails: data.emails.filter(Boolean),
        preferredContactMethod: data.preferredContactMethod,
        orderDetails: data.orderDetails,
        deliveryAddress: data.deliveryAddress,
        ...(isCompany && {
          commercialRegistrationNumber: data.commercialRegistrationNumber,
          taxNumber: data.taxNumber,
          nationalAddress: data.nationalAddress,
        }),
      };
      await quoteRequestApi.send(payload);
      setSuccess(true);
      reset({
        customerType: "individual",
        name: "",
        phone: "",
        emails: [""],
        preferredContactMethod: "phone",
        orderDetails: "",
        deliveryAddress: "",
        commercialRegistrationNumber: "",
        taxNumber: "",
        nationalAddress: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("form.error");
      toast.error(message);
    }
  };

  return (
    <Card className="border border-border/70 bg-card rounded-3xl backdrop-blur-xl relative overflow-hidden">
      {success ? (
        <ScrollReveal
          key="success"
          animation="fade"
          duration={300}
          className="p-8 sm:p-14 text-center space-y-6"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
            <div className="relative w-20 h-20 bg-success/80 text-success-foreground border border-success rounded-full flex items-center justify-center shadow-lg">
              <CheckIcon className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black title-gradient">
              {t("form.success")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("form.success_message")}
            </p>
          </div>

          {/* Next Steps Card */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 max-w-md mx-auto text-start space-y-2 text-xs sm:text-sm text-muted-foreground">
            <div className="font-bold text-foreground flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              {t("form.nextStepsTitle")}
            </div>
            <p>{t("form.nextStepsDesc")}</p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="rounded-xl h-12 px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all shadow-sm"
            onClick={() => setSuccess(false)}
          >
            {t("form.submitAnother")}
          </Button>
        </ScrollReveal>
      ) : (
        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Customer Type */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider title-gradient">
                  {t("form.customerType")}
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {t("form.entityTypeHint")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {customerTypes.map((type) => {
                  const isSelected = customerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setValue("customerType", type, {
                          shouldValidate: true,
                        })
                      }
                      className={`relative p-4 rounded-2xl font-bold transition-all text-start border flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted/20 border-border/70 text-foreground/80 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {type === "individual" ? (
                          <UserIcon className="w-5 h-5" />
                        ) : (
                          <UsersIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-0.5 grow">
                        <div className="text-sm font-bold leading-tight">
                          {type === "individual"
                            ? t("form.customerTypeIndividual")
                            : t("form.customerTypeCompany")}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-normal">
                          {type === "individual"
                            ? t("form.customerTypeIndividualDesc")
                            : t("form.customerTypeCompanyDesc")}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="hidden sm:flex w-5 h-5 rounded-full bg-success text-success-foreground items-center justify-center shrink-0">
                          <CheckIcon className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-3 border-b border-border/40">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-sm font-bold title-gradient">
                  {t("form.sectionContactInfo")}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <Input
                    label={t("form.name")}
                    placeholder={t("form.placeholders.name")}
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <Input
                    label={t("form.phone")}
                    type="tel"
                    placeholder={t("form.placeholders.phone")}
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                </div>
              </div>
              <Input
                label={t("form.email")}
                type="email"
                placeholder={t("form.placeholders.email")}
                {...register(`emails.${0}` as const)}
                error={errors.emails?.[0]?.message}
              />
              {/* Emails Array */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-4">
                  {emailFields.length < 5 && (
                    <button
                      type="button"
                      onClick={() => appendEmail("")}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-all cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      {t("form.addEmail")}
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {emailFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 mt-6"
                    >
                      <Input
                        label={t("form.email")}
                        type="email"
                        placeholder={t("form.placeholders.email")}
                        {...register(`emails.${index + 1}` as const)}
                        error={errors.emails?.[index + 1]?.message}
                      />
                      {emailFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => removeEmail(index + 1)}
                          aria-label={t("form.removeEmail")}
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Company Fields (When Company is Selected) */}
            {isCompany && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-sm font-bold title-gradient">
                      {t("form.sectionCompanyDetails")}
                    </h3>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {t("form.companyRequiredBadge")}
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-secondary/25 border border-border/60 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Commercial Registration */}
                    <div className="space-y-1.5">
                      <Input
                        label={t("form.commercialRegistrationNumber")}
                        placeholder={t(
                          "form.placeholders.commercialRegistrationNumber",
                        )}
                        {...register("commercialRegistrationNumber")}
                        error={errors.commercialRegistrationNumber?.message}
                      />
                    </div>

                    {/* Tax Number */}
                    <div className="space-y-1.5">
                      <Input
                        label={t("form.taxNumber")}
                        placeholder={t("form.placeholders.taxNumber")}
                        {...register("taxNumber")}
                        error={errors.taxNumber?.message}
                      />
                    </div>
                  </div>

                  {/* National Address */}
                  <div className="space-y-1.5">
                    <Textarea
                      label={t("form.nationalAddress")}
                      placeholder={t("form.placeholders.nationalAddress")}
                      {...register("nationalAddress")}
                      error={errors.nationalAddress?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Quote & Requirement Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {isCompany ? "3" : "2"}
                </span>
                <h3 className="text-sm font-bold title-gradient">
                  {t("form.sectionRequirements")}
                </h3>
              </div>

              {/* Order Details */}
              <div className="space-y-1.5">
                <Textarea
                  label={t("form.orderDetails")}
                  // className="min-h-32 transition-all rounded-xl text-sm p-4 resize-none placeholder:text-muted-foreground/50 leading-relaxed"
                  placeholder={t("form.placeholders.orderDetails")}
                  {...register("orderDetails")}
                  error={errors.orderDetails?.message}
                />
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold title-gradient flex items-center justify-between">
                  <span>
                    {t("form.deliveryAddress")}{" "}
                    <span className="text-destructive">*</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5 text-primary" />
                    {t("form.deliveryAddressHint")}
                  </span>
                </label>
                <Textarea
                  className="min-h-24  transition-all rounded-xl text-sm p-4 resize-none placeholder:text-muted-foreground/50 leading-relaxed"
                  placeholder={t("form.placeholders.deliveryAddress")}
                  {...register("deliveryAddress")}
                  error={errors.deliveryAddress?.message}
                />
              </div>
            </div>

            {/* Section 5: Preferred Contact Method */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold title-gradient block">
                {t("form.preferredContactMethod")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {contactMethods.map((method) => {
                  const isSelected = preferredContactMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() =>
                        setValue("preferredContactMethod", method, {
                          shouldValidate: true,
                        })
                      }
                      className={`h-12 px-4 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer text-sm ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary "
                          : "bg-muted/20 border-border/70 text-foreground/80 hover:bg-muted/40 hover:border-border"
                      }`}
                    >
                      {method === "phone" ? (
                        <PhoneIcon className="w-4 h-4" />
                      ) : (
                        <MailIcon className="w-4 h-4" />
                      )}
                      <span>
                        {method === "phone"
                          ? t("form.contactMethodPhone")
                          : t("form.contactMethodEmail")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-black rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 gap-2 group transition-all"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                    {t("form.submitting")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {t("form.submit")}
                    <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldIcon className="w-3.5 h-3.5 text-primary" />
                <span>{t("form.privacyNote")}</span>
              </p>
            </div>
          </form>
        </div>
      )}
    </Card>
  );
}
