"use client";

import { useState } from "react";
import { Order } from "@/features/orders/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import { useToast } from "@/shared/hooks/useToast";
import { useTranslations } from "next-intl";
import { CheckIcon, EditIcon, SpinnerIcon, XIcon } from "@/shared/ui/Icons";

interface OrderNotesProps {
  order: Order;
}

export default function OrderNotes({ order }: OrderNotesProps) {
  const updateStatusMutation = useUpdateOrderStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [notesText, setNotesText] = useState(order.notes || "");
  const t = useTranslations("orders");
  const tButtons = useTranslations("buttons");

  const { success: toastSuccess, error: toastError } = useToast();

  const handleSaveNotes = async () => {
    const trimmedNotes = notesText.trim();

    if (
      trimmedNotes === order.notes ||
      (trimmedNotes.length === 0 && !order.notes)
    ) {
      setIsEditing(false);
      return;
    }
    if (trimmedNotes.length > 400) {
      toastError(t("messages.errorNotes"));
      setIsEditing(false);
      return;
    }
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        notes: trimmedNotes,
      });

      setIsEditing(false);
      toastSuccess(t("messages.successNotes"));
    } catch (err) {
      toastError(t("messages.errorNotes"));
      console.error("Failed to update notes:", err);
    }
  };

  const handleCancel = () => {
    setNotesText(order.notes || "");
    setIsEditing(false);
  };

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4 bg-muted/70">
        <CardTitle className="text-sm font-bold title-gradient">
          {t("notes")}
        </CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="rounded-xl font-bold text-xs h-8 px-3 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5"
          >
            <EditIcon className="w-3 h-3 text-muted-foreground" />
            {tButtons("edit")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-secondary/10 focus:outline-none focus:ring-1 focus:ring-primary/20 text-xs font-semibold text-foreground resize-none leading-relaxed"
              placeholder="Add internal notes about this order..."
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="rounded-xl font-bold px-3 h-8"
              >
                <XIcon className="w-3.5 h-3.5 mr-1" />
                {tButtons("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateStatusMutation.isPending}
                className="rounded-xl font-bold px-4 h-8 flex items-center gap-1.5"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <SpinnerIcon className="w-3.5 h-3.5 animate-spin" />
                    {tButtons("saving")}
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    {tButtons("save")}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {order.notes ? (
              <div className="p-4 rounded-xl bg-secondary/10 border border-border/20 text-xs font-semibold text-foreground leading-relaxed whitespace-pre-line">
                {order.notes}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-800">
                <p className="font-bold">{t("notNotes")}</p>
                <p className="font-medium text-amber-800/80 mt-0.5">
                  {t("addNotes")}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
