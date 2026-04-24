import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import SendMeDocumentSheet from "./SendMeDocumentSheet";
import LineItemsEditor from "./LineItemsEditor";
import { pdfFromElement } from "../pdfFromElement";
import type { SendMeLineItem, SendMePartyDetails } from "../types";
import { defaultSendMeIssuer } from "../sendMeAdminDefaults";
import { SEND_ME_BTN_PRIMARY_MD } from "@/features/sendMe/buttonStyles";
import { SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants/brand";

interface SendMeAdminDocumentBuilderProps {
  kind: "quotation" | "invoice";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultDocNumber(prefix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.floor(Math.random() * 900) + 100;
  return `${prefix}-${y}${m}${day}-${r}`;
}

export default function SendMeAdminDocumentBuilder({ kind }: SendMeAdminDocumentBuilderProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const [docNumber, setDocNumber] = useState(() =>
    kind === "quotation" ? defaultDocNumber("QUO") : defaultDocNumber("INV"),
  );
  const [issuedDate, setIssuedDate] = useState(todayISO);
  const [validUntil, setValidUntil] = useState(() => {
    const t = new Date();
    t.setDate(t.getDate() + 30);
    return t.toISOString().slice(0, 10);
  });
  const [dueDate, setDueDate] = useState(() => {
    const t = new Date();
    t.setDate(t.getDate() + 7);
    return t.toISOString().slice(0, 10);
  });

  const [issuer, setIssuer] = useState<SendMePartyDetails>({ ...defaultSendMeIssuer });
  const [client, setClient] = useState<SendMePartyDetails>({
    name: "",
    address: "",
    email: "",
    phone: "",
  });

  const [lineItems, setLineItems] = useState<SendMeLineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxPercent, setTaxPercent] = useState(15);
  const [notes, setNotes] = useState(
    kind === "quotation"
      ? "This quotation is valid for the period shown above. Prices exclude any travel or materials unless stated."
      : "Payment due by the due date. Please use the invoice number as payment reference.",
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePdf = async () => {
    if (!sheetRef.current) {
      toast.error("Preview is not ready.");
      return;
    }
    setDownloading(true);
    try {
      const base = docNumber.replace(/[^a-zA-Z0-9-_]+/g, "-");
      await pdfFromElement(sheetRef.current, `${kind}-${base}`);
      toast.success("PDF downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const partyFields = (label: string, p: SendMePartyDetails, setP: (v: SendMePartyDetails) => void) => (
    <div className="space-y-3 rounded-lg border border-white/15 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      <div>
        <Label className="text-white/80">Name</Label>
        <Input
          value={p.name}
          onChange={(e) => setP({ ...p, name: e.target.value })}
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
        />
      </div>
      <div>
        <Label className="text-white/80">Address</Label>
        <Textarea
          value={p.address}
          onChange={(e) => setP({ ...p, address: e.target.value })}
          rows={3}
          className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-white/80">Email</Label>
          <Input
            value={p.email}
            onChange={(e) => setP({ ...p, email: e.target.value })}
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
          />
        </div>
        <div>
          <Label className="text-white/80">Phone</Label>
          <Input
            value={p.phone}
            onChange={(e) => setP({ ...p, phone: e.target.value })}
            className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #sendme-admin-print-root, #sendme-admin-print-root * { visibility: visible !important; }
          #sendme-admin-print-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
        }
      `}</style>
      <div className="min-h-0 print:bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 print:hidden">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">
              {kind === "quotation" ? "Quotation" : "Invoice"} builder
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="gap-2 bg-white/15 text-white hover:bg-white/25"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                type="button"
                className={`gap-2 ${SEND_ME_BTN_PRIMARY_MD}`}
                style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
                onClick={handlePdf}
                disabled={downloading}
              >
                <Download className="h-4 w-4" />
                {downloading ? "Saving…" : "Download PDF"}
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-white/80">Document number</Label>
                  <Input
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Issue date</Label>
                  <Input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => setIssuedDate(e.target.value)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                </div>
                {kind === "quotation" ? (
                  <div>
                    <Label className="text-white/80">Valid until</Label>
                    <Input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-white/80">Due date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="border-white/20 bg-white/10 text-white"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-white/80">VAT %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    className="border-white/20 bg-white/10 text-white"
                  />
                </div>
              </div>

              {partyFields("Your business (from)", issuer, setIssuer)}
              {partyFields("Client (bill to)", client, setClient)}

              <LineItemsEditor items={lineItems} onChange={setLineItems} />

              <div>
                <Label className="text-white/80">Notes / terms</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              <p className="mb-2 text-sm font-medium text-white/80">Preview</p>
              <div className="max-h-[70vh] overflow-auto rounded-lg border border-white/20 bg-gray-900/40 p-2">
                <div className="origin-top scale-[0.42] sm:scale-[0.48]" style={{ width: "794px" }}>
                  <SendMeDocumentSheet
                    kind={kind}
                    docNumber={docNumber}
                    issuedDate={issuedDate}
                    validUntil={kind === "quotation" ? validUntil : undefined}
                    dueDate={kind === "invoice" ? dueDate : undefined}
                    issuer={issuer}
                    client={client}
                    lineItems={lineItems}
                    taxPercent={taxPercent}
                    notes={notes}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-size DOM for PDF capture (unscaled) */}
        <div
          className="pointer-events-none fixed left-[-12000px] top-0 -z-10 opacity-0"
          aria-hidden
        >
          <SendMeDocumentSheet
            ref={sheetRef}
            kind={kind}
            docNumber={docNumber}
            issuedDate={issuedDate}
            validUntil={kind === "quotation" ? validUntil : undefined}
            dueDate={kind === "invoice" ? dueDate : undefined}
            issuer={issuer}
            client={client}
            lineItems={lineItems}
            taxPercent={taxPercent}
            notes={notes}
          />
        </div>

        <div id="sendme-admin-print-root" className="hidden print:block">
          <SendMeDocumentSheet
            kind={kind}
            docNumber={docNumber}
            issuedDate={issuedDate}
            validUntil={kind === "quotation" ? validUntil : undefined}
            dueDate={kind === "invoice" ? dueDate : undefined}
            issuer={issuer}
            client={client}
            lineItems={lineItems}
            taxPercent={taxPercent}
            notes={notes}
          />
        </div>
      </div>
    </>
  );
}
