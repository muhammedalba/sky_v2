import React from "react";

interface InvoiceHeaderProps {
  siteNameAr: string;
  siteNameEn: string;
  siteLogo: string;
  crNo: string;
  vatNo: string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  siteNameAr,
  siteNameEn,
  siteLogo,
  crNo,
  vatNo,
}) => {
  return (
    <div className="grid grid-cols-3 items-center gap-2 pb-2 border-b border-black">
      {/* Right Column: Arabic Info */}
      <div
        className="text-right text-[11px] leading-snug space-y-0.5 text-slate-800"
        dir="rtl"
      >
        <p className="font-bold text-xs text-primary">{siteNameAr}</p>
        <p className="font-bold">
          <span className="font-semibold">رقم السجل التجاري:</span> {crNo}
        </p>
        <p className="font-bold">
          <span className="font-semibold">رقم التسجيل الضريبي:</span> {vatNo}
        </p>
      </div>

      {/* Center Column: Logo & Tagline */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={siteLogo}
          alt={`${siteNameAr} Logo`}
          className="h-16 w-auto object-contain mb-1"
        />
        <p className="font-bold text-[12px] text-sky-950">{siteNameAr}</p>
        <p className="text-[9px] text-slate-600 font-medium">{siteNameEn}</p>
      </div>

      {/* Left Column: English Info */}
      <div
        className="text-left text-[11px] leading-snug space-y-0.5 text-slate-800"
        dir="ltr"
      >
        <p className="font-bold text-xs text-primary uppercase">{siteNameEn}</p>
        <p className="font-bold">
          <span className="font-semibold">CR No.:</span> {crNo}
        </p>
        <p className="font-bold">
          <span className="font-semibold">VAT Registration number:</span>{" "}
          {vatNo}
        </p>
      </div>
    </div>
  );
};
