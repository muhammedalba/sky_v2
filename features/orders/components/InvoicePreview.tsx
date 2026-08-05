'use client';

import { Order } from '@/features/orders/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { DownloadIcon, PrinterIcon, FileTextIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useTranslations } from 'next-intl';

interface InvoicePreviewProps {
  order: Order;
  onPreviewInvoice?: () => void;
  onDownloadInvoice?: () => void;
}

export default function InvoicePreview({
  order,
  onPreviewInvoice,
  onDownloadInvoice,
}: InvoicePreviewProps) {
  const t = useTranslations('orders.invoicePreview');

  return (
    <Card className="border border-border/40 shadow-xs bg-card rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between gap-4 bg-muted/70">
        <CardTitle className="text-sm font-bold title-gradient">{t('title')}</CardTitle>
        <div className="flex items-center gap-2">
          {onDownloadInvoice && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadInvoice}
              className="rounded-xl font-bold text-xs h-8 px-3 bg-card border-border hover:bg-secondary/40 flex items-center gap-1.5"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-muted-foreground" />
              {t('download')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {order.InvoicePdf ? (
          <div className="w-full h-100 relative bg-secondary/5">
            <iframe
              src={`${order.InvoicePdf}#toolbar=0&navpanes=0`}
              className="w-full h-full border-none"
              title={t('pdfTitle')}
            />
          </div>
        ) : (
          <div className="p-8 border-none flex flex-col items-center justify-center text-center space-y-3 bg-secondary/5 h-75">
            <div className="p-3 bg-secondary/35 text-muted-foreground rounded-full">
              <FileTextIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">{t('noPdfGenerated')}</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-70">
                {t('noPdfDesc')}
              </p>
            </div>
            {onPreviewInvoice && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviewInvoice}
                className="rounded-xl font-bold text-xs"
              >
                {t('openPreview')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
