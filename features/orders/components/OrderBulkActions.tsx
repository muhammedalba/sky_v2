'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import ConfirmDialog from '@/shared/ui/ConfirmDialog';
import { TrashIcon, DownloadIcon, XIcon, CheckIcon, ChevronDownIcon } from '@/shared/ui/Icons';

interface OrderBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => Promise<void> | void;
  onBulkDelete: () => Promise<void> | void;
  onBulkExport: () => void;
}

const BULK_STATUS_OPTIONS = [
  { value: 'pending', label: 'Mark as Pending' },
  { value: 'processing', label: 'Mark as Processing' },
  { value: 'shipped', label: 'Mark as Shipped' },
  { value: 'delivered', label: 'Mark as Delivered' },
  { value: 'completed', label: 'Mark as Completed' },
  { value: 'cancelled', label: 'Mark as Cancelled' },
];

export default function OrderBulkActions({
  selectedCount,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkDelete,
  onBulkExport,
}: OrderBulkActionsProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (selectedCount === 0) return null;

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      await onBulkStatusUpdate(status);
      setIsUpdateOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onBulkDelete();
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-background border border-border/60 rounded-full shadow-2xl shadow-black/10 animate-in slide-in-from-bottom-6 duration-300">
        {/* Count Badge */}
        <div className="flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground font-black rounded-full h-6 min-w-6 px-1.5 flex items-center justify-center border-none text-xs">
            {selectedCount}
          </Badge>
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Selected
          </span>
        </div>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Update Status Dropdown */}
        <div className="relative group/bulk">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateOpen(!isUpdateOpen)}
            className="h-9 px-3 rounded-full text-xs font-bold gap-1 border-border/40"
          >
            Update Status
            <ChevronDownIcon className="w-3.5 h-3.5 opacity-60" />
          </Button>

          {isUpdateOpen && (
            <div className="absolute bottom-full mb-2 inset-s-0 w-44 py-1.5 bg-popover border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95">
              {BULK_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={isUpdating}
                  onClick={() => handleStatusUpdate(opt.value)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-start font-medium text-foreground hover:bg-muted/60 disabled:opacity-50 transition-colors"
                >
                  <CheckIcon className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkExport}
          className="h-9 px-3 rounded-full text-xs font-bold gap-1.5 border-border/40"
        >
          <DownloadIcon className="w-3.5 h-3.5 text-muted-foreground" />
          Export
        </Button>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setIsDeleteOpen(true)}
          className="h-9 px-3 rounded-full text-xs font-bold gap-1.5"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Delete
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-full hover:bg-muted/40"
          title="Deselect all"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Selected Orders"
        message={`Are you sure you want to permanently delete these ${selectedCount} orders? This action cannot be undone.`}
        confirmText="Delete Orders"
        cancelText="Keep Orders"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </>
  );
}
