'use client';

import { useState } from 'react';
import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useUpdateOrderStatus } from '@/features/orders/hooks/useOrders';
import { PencilIcon, CheckIcon, XIcon, Loader2Icon } from 'lucide-react';

interface OrderNotesProps {
  order: Order;
}

export default function OrderNotes({ order }: OrderNotesProps) {
  const updateStatusMutation = useUpdateOrderStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [notesText, setNotesText] = useState(order.notes || '');

  const handleSaveNotes = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: order._id,
        notes: notesText,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  const handleCancel = () => {
    setNotesText(order.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-sm font-bold text-foreground">Notes</CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="rounded-xl font-bold text-xs h-8 px-3 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5"
          >
            <PencilIcon className="w-3 h-3 text-muted-foreground" />
            Edit
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
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={updateStatusMutation.isPending}
                className="rounded-xl font-bold px-4 h-8 flex items-center gap-1.5"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    Save
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
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold">No notes added</p>
                <p className="font-medium text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  Add internal notes about this order...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
