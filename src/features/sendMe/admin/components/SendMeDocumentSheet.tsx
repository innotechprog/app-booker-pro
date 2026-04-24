import { forwardRef } from "react";
import type { SendMeLineItem, SendMePartyDetails } from "../types";
import { SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants/brand";
import ibLogoBlack from "@/images/ib-logo-black.png";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);
}

export interface SendMeDocumentSheetProps {
  kind: "quotation" | "invoice";
  docNumber: string;
  issuedDate: string;
  /** Quotation: valid until */
  validUntil?: string;
  /** Invoice: due date */
  dueDate?: string;
  issuer: SendMePartyDetails;
  client: SendMePartyDetails;
  lineItems: SendMeLineItem[];
  taxPercent: number;
  notes: string;
}

const SendMeDocumentSheet = forwardRef<HTMLDivElement, SendMeDocumentSheetProps>(
  (
    {
      kind,
      docNumber,
      issuedDate,
      validUntil,
      dueDate,
      issuer,
      client,
      lineItems,
      taxPercent,
      notes,
    },
    ref,
  ) => {
    const subtotal = lineItems.reduce((s, row) => s + row.quantity * row.unitPrice, 0);
    const tax = subtotal * (taxPercent / 100);
    const total = subtotal + tax;
    const title = kind === "quotation" ? "Quotation" : "Tax Invoice";

    return (
      <div
        ref={ref}
        className="box-border bg-white p-10 text-gray-900"
        style={{ width: "794px", minHeight: "1123px", fontFamily: "system-ui, sans-serif" }}
      >
        <div className="mb-8 flex items-start justify-between border-b-2 pb-6" style={{ borderColor: SEND_ME_BRAND_BLUE }}>
          <div>
            {kind === "quotation" ? (
              <img
                src={ibLogoBlack}
                alt="IB Innovative Solutions"
                className="mb-3 h-10 w-auto object-contain"
              />
            ) : null}
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: SEND_ME_BRAND_BLUE }}>
              Send Me
            </h1>
            <p className="text-sm text-gray-600">Field & on-demand services</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600">{docNumber}</p>
            <p className="mt-1 text-sm text-gray-600">Date: {issuedDate}</p>
            {kind === "quotation" && validUntil ? (
              <p className="text-sm text-gray-600">Valid until: {validUntil}</p>
            ) : null}
            {kind === "invoice" && dueDate ? <p className="text-sm text-gray-600">Due: {dueDate}</p> : null}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="mb-1 font-semibold text-gray-500">From</p>
            <p className="font-medium">{issuer.name}</p>
            <p className="whitespace-pre-line text-gray-700">{issuer.address}</p>
            {issuer.email ? <p className="text-gray-700">{issuer.email}</p> : null}
            {issuer.phone ? <p className="text-gray-700">{issuer.phone}</p> : null}
          </div>
          <div>
            <p className="mb-1 font-semibold text-gray-500">Bill to</p>
            <p className="font-medium">{client.name || "—"}</p>
            <p className="whitespace-pre-line text-gray-700">{client.address || "—"}</p>
            {client.email ? <p className="text-gray-700">{client.email}</p> : null}
            {client.phone ? <p className="text-gray-700">{client.phone}</p> : null}
          </div>
        </div>

        <table className="mb-6 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-white" style={{ backgroundColor: SEND_ME_BRAND_BLUE }}>
              <th className="px-3 py-2 font-semibold">Description</th>
              <th className="w-20 px-3 py-2 font-semibold">Qty</th>
              <th className="w-28 px-3 py-2 font-semibold">Unit</th>
              <th className="w-32 px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr className="border-b border-gray-200">
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  Add line items in the form
                </td>
              </tr>
            ) : (
              lineItems.map((row) => (
                <tr key={row.id} className="border-b border-gray-200">
                  <td className="px-3 py-2">{row.description || "—"}</td>
                  <td className="px-3 py-2">{row.quantity}</td>
                  <td className="px-3 py-2">{formatMoney(row.unitPrice)}</td>
                  <td className="px-3 py-2 text-right">{formatMoney(row.quantity * row.unitPrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">VAT ({taxPercent}%)</span>
            <span>{formatMoney(tax)}</span>
          </div>
          <div
            className="flex justify-between border-t-2 pt-2 text-base font-bold"
            style={{ borderColor: SEND_ME_BRAND_BLUE }}
          >
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>

        {notes.trim() ? (
          <div className="mt-10 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <p className="mb-1 font-semibold text-gray-900">Notes / terms</p>
            <p className="whitespace-pre-line">{notes}</p>
          </div>
        ) : null}
      </div>
    );
  },
);

SendMeDocumentSheet.displayName = "SendMeDocumentSheet";

export default SendMeDocumentSheet;
