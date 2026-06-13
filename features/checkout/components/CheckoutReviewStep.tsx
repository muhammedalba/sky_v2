"use client";

import  { useMemo } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckoutFormValues } from "../schemas/checkout.schema";
import { ActivePaymentMethod } from "../hooks/useCheckout";
import { useTranslations } from "next-intl";
import { useTrans } from "@/shared/hooks/useTrans";

/**
 * @interface CheckoutReviewStepProps
 * توثيق أنواع الخصائص (Props) المدخلة للمكون لضمان سلامة البيانات (Type Safety)
 */
interface CheckoutReviewStepProps {
  selectedCityName: string;
  selectedCountryName: string;
  selectedShippingProviderName: string;
  selectedPayment: ActivePaymentMethod | undefined;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
}

/**
 * مكون خطوة مراجعة الطلب (CheckoutReviewStep)
 * يعرض ملخصاً شاملاً لبيانات الشحن والدفع والعميل قبل إتمام الطلب نهائياً.
 */
export function CheckoutReviewStep({
  selectedCityName = "",
  selectedCountryName = "",
  selectedShippingProviderName = "",
  selectedPayment,
  onBack,
  onPlaceOrder,
  isSubmitting,
}: CheckoutReviewStepProps) {
  // جلب كائن التحكم (control) الخاص بـ react-hook-form لإدارة حالة المدخلات
  const { control } = useFormContext<CheckoutFormValues>();

  // ─── 1. تحسين الأداء: دمج خطافات المراقبة (useWatch Optimization) ───
  // بدلاً من استدعاء خطاف المراقبة 3 مرات منفصلة، نقوم بمراقبة المدخلات كمصفوفة في طلب واحد
  // هذا يقلل من استهلاك الذاكرة ويجعل المكون يستمع للتغيرات بشكل موحد.
  const [firstName, lastName, street] = useWatch({
    control,
    name: ["firstName", "lastName", "street"],
  });

  // تهيئة دوال الترجمة والترجمة المحلية المخصصة للغات
  const t = useTranslations("cart");
  const getTrans = useTrans();

  // ─── 2. تحسين الأداء: تخزين وحفظ نص طريقة الدفع (Memoization) ───
  // نستخدم useMemo لمنع إعادة معالجة وتمرير الاسم من دالة getTrans مع كل دورة تصيير (Render)،
  // ويتم التحديث فقط إذا تغيرت طريقة الدفع الفعلية أو تغيرت دالة الترجمة.
  const paymentLabel = useMemo(() => {
    return selectedPayment ? getTrans(selectedPayment.name) : "—";
  }, [selectedPayment, getTrans]);

  // ─── 3. تحصين البيانات (Defensive Fallbacks) ───
  // نضمن وجود نصوص فارغة بديلة كخط دفاع أول لمنع انهيار المكون أو إظهار نصوص عشوائية في الواجهة
  const safeFirstName = firstName ?? "";
  const safeLastName = lastName ?? "";
  const safeStreet = street ?? "";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/3">
        <h2 className="text-xl font-black text-foreground mb-4">
          {t("review.title")}
        </h2>
        
        <div className="space-y-4 text-sm bg-muted/20 p-4 rounded-xl border border-border/40">

          {/* اسم العميل */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{t("review.name")}</span>
            <span className="font-semibold">
              {safeFirstName} {safeLastName}
            </span>
          </div>

          {/* عنوان الشحن الاستلام */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{t("review.address")}</span>
            <span className="font-semibold text-end">
              {/* تجميع العنوان بذكاء؛ نقوم بفلترة أي قيم فارغة لتفادي ظهور فواصل غريبة مثل (, , الرياض) */}
              {[safeStreet, selectedCityName, selectedCountryName]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>

          {/* مزود خدمة الشحن */}
          <div className="flex justify-between border-b border-border/40 pb-3">
            <span className="text-muted-foreground">{t("review.shipping")}</span>
            <span className="font-semibold">
              {selectedShippingProviderName || "—"}
            </span>
          </div>

          {/* وسيلة الدفع المعتمدة */}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("review.payment")}</span>
            <span className="font-semibold">{paymentLabel}</span>
          </div>

        </div>
      </div>

      {/* أزرار التحكم السفلى للتنقل وإتمام العمليات */}
      <div className="flex gap-4 mt-8">
        
        {/* زر العودة للخطوة السابقة */}
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-1/3 h-14 bg-muted text-foreground rounded-2xl font-bold text-base hover:bg-muted/80 transition-all disabled:opacity-50"
        >
          {t("review.back")}
        </button>
        
        {/* زر إتمام تأكيد الطلب النهائي */}
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="flex-1 h-14 bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* تغيير الأيقونة ديناميكياً بناءً على حالة المعالجة الحالية في الخلفية */}
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {isSubmitting
            ? t("review.confirming")
            : t("review.confirm_order")}
        </button>
        
      </div>
    </div>
  );
}