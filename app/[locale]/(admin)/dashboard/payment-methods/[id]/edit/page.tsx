"use client";

import { use } from "react";
import PaymentMethodForm from "@/features/payments/components/dashboard/PaymentMethodForm";
import { useAdminPaymentMethod } from "@/features/payments/hooks/usePaymentMethods";

export default function EditPaymentMethodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: method, isLoading } = useAdminPaymentMethod(id);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in pb-10">
        <div className="space-y-2">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-1/4 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!method) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Payment method not found.
      </div>
    );
  }

  return <PaymentMethodForm initialData={method} />;
}
