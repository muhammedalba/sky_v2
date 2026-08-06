import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { buildZatcaTlvBase64 } from "../utils/invoiceUtils";

interface ZatcaQrCodeProps {
  sellerName: string;
  vatNumber: string;
  invoiceDateTime: string;
  totalWithVat: string;
  vatAmount: string;
  invoiceHash?: string;
}

/**
 * ZATCA Phase-1 & Phase-2 QR Code component.
 * Encodes invoice data to TLV Base64 (including Tag 6 Invoice Hash) and renders a scannable QR code.
 */
export const ZatcaQrCode = React.memo(function ZatcaQrCode({
  sellerName,
  vatNumber,
  invoiceDateTime,
  totalWithVat,
  vatAmount,
  invoiceHash,
}: ZatcaQrCodeProps) {
  const base64Tlv = useMemo(
    () =>
      buildZatcaTlvBase64({
        sellerName,
        vatNumber,
        invoiceDateTime,
        totalWithVat,
        vatAmount,
        invoiceHash,
      }),
    [sellerName, vatNumber, invoiceDateTime, totalWithVat, vatAmount, invoiceHash],
  );

  return (
    <div className="w-36 h-36 bg-white flex flex-col items-center justify-center">
      <QRCodeSVG
        value={base64Tlv}
        size={140}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
      />
    </div>
  );
});
