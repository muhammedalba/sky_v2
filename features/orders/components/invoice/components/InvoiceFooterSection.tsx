import React from "react";

interface InvoiceFooterSectionProps {
  accountName: string;
  bankName: string;
  accountNumber: string;
  iban: string;
  companyCountryAr: string;
  companyCityAr: string;
  companyAreaAr: string;
  companyStreetAr: string;
  companyCountryEn: string;
  companyCityEn: string;
  companyAreaEn: string;
  companyStreetEn: string;
  mailBox: string;
  poBox: string;
  phone: string;
  email: string;
}

export const InvoiceFooterSection: React.FC<InvoiceFooterSectionProps> = ({
  accountName,
  bankName,
  accountNumber,
  iban,
  companyCountryAr,
  companyCityAr,
  companyAreaAr,
  companyStreetAr,
  companyCountryEn,
  companyCityEn,
  companyAreaEn,
  companyStreetEn,
  mailBox,
  poBox,
  phone,
  email,
}) => {
  return (
    <div className="space-y-4">
      {/* 7. Signatures & Bank Details */}
      <div className="grid grid-cols-2 gap-4 border border-black p-3 text-[10px]">
        {/* Signatures */}
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-dashed border-slate-400 pb-2">
            <span className="font-bold">أعدت من قبل / Prepared by:</span>
            <span className="font-mono">..........</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold">المستلم / Received by:</span>
            <span className="font-mono">..........</span>
          </div>
        </div>

        {/* Bank Account Info */}
        <div className="bg-slate-50 border-r border-black p-2 space-y-1 text-right font-medium">
          <p>
            <span className="font-bold">اسم الحساب / Account Name:</span>{" "}
            {accountName}
          </p>
          <p>
            <span className="font-bold">البنك / Bank:</span> {bankName}
          </p>
          <p>
            <span className="font-bold">رقم الحساب / Account No.:</span>{" "}
            {accountNumber}
          </p>
          <p>
            <span className="font-bold">رقم الحساب الدولي / IBAN:</span> {iban}
          </p>
        </div>
      </div>

      {/* Return Policy */}
      <div className="border border-red-500 bg-red-50 p-2 text-center text-[10px] font-semibold text-red-900">
        <p className="font-bold text-red-700 underline mb-0.5">
          سياسة الاستبدال والاسترجاع:
        </p>
        <p>
          استبدال واسترجاع خلال 5 أيام فقط من تاريخ الفاتورة شرط ان تكون
          المنتجات على حالتها الاصلية
        </p>
      </div>

      {/* 8. Company Official Address & Contact Info Footer */}
      <div className="border-t-2 border-black pt-2 text-center text-[9px] space-y-1 text-slate-700">
        <p className="font-semibold">
          {companyCountryAr} - {companyCityAr} - {companyAreaAr} -{" "}
          {companyStreetAr} - صندوق بريد {mailBox} - الرمز البريدي {poBox}
        </p>
        <p dir="ltr" className="font-sans text-[8.5px]">
          {companyCountryEn} - {companyCityEn} - {companyAreaEn} -{" "}
          {companyStreetEn} - P.O. Box {mailBox} - Postal Code {poBox}
        </p>
        <div className="flex justify-between items-center text-[8.5px] font-mono pt-1 text-slate-600 border-t border-slate-200">
          <span>
            Printed On:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </span>
          <span>1 / 1</span>
          <span>
            {phone && `Mob: ${phone} - `}
            {email && `E-mail: ${email}`}
          </span>
        </div>
      </div>
    </div>
  );
};
