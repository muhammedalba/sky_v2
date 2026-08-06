import React from "react";

interface AddressDetails {
  country: string;
  city: string;
  area: string;
  street: string;
  mailBox: string;
  poBox: string;
}

interface InvoicePartyBoxProps {
  titleAr: string;
  titleEn: string;
  name: string;
  vatTitleAr: string;
  vatTitleEn: string;
  vatNo: string;
  address: AddressDetails;
}

export const InvoicePartyBox: React.FC<InvoicePartyBoxProps> = ({
  titleAr,
  titleEn,
  name,
  vatTitleAr,
  vatTitleEn,
  vatNo,
  address,
}) => {
  return (
    <div className="border border-black text-[10px]">
      <div className="font-bold p-1.5 border-b border-black flex justify-between items-center flex-wrap gapx-2 bg-muted/40">
        <div className="gap-2 flex flex-col flex-1">
          <span className="bg-sky-100 text-sky-950 p-1">
            {titleAr} / {titleEn}:
          </span>
          <span className="ml-4">{name}</span>
        </div>

        <div className="flex gap-1 font-bold flex-col gap-y-2">
          <span className="bg-sky-100 text-sky-950 p-1">
            {vatTitleEn} / {vatTitleAr}
          </span>
          <span className="font-bold tracking-wider text-center">{vatNo}</span>
        </div>
      </div>
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-black font-semibold">
            <th className="p-1 border-l border-black">البلد | Country</th>
            <th className="p-1 border-l border-black">المدينة | City</th>
            <th className="p-1 border-l border-black">المنطقة | Area</th>
            <th className="p-1 border-l border-black">الشارع | Street</th>
            <th className="p-1 border-l border-black">
              صندوق بريد | Mail Box
            </th>
            <th className="p-1">الرمز البريدي | Po Box</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-1 border-l border-black">{address.country}</td>
            <td className="p-1 border-l border-black">{address.city}</td>
            <td className="p-1 border-l border-black">{address.area}</td>
            <td className="p-1 border-l border-black">{address.street}</td>
            <td className="p-1 border-l border-black">{address.mailBox}</td>
            <td className="p-1">{address.poBox}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
