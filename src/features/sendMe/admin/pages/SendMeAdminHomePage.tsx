import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt } from "lucide-react";
import { SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants/brand";
import { SEND_ME_BTN_PRIMARY_MD } from "@/features/sendMe/buttonStyles";

export default function SendMeAdminHomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-white">Send Me admin</h1>
        <p className="mb-10 text-white/70">Create client quotations and tax invoices, then print or download PDF.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <FileText className="mb-2 h-10 w-10 text-white/90" />
              <CardTitle>Quotation</CardTitle>
              <CardDescription className="text-white/65">
                Line items, VAT, validity date — export PDF for clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/sendme/admin/quotation"
                className={`inline-flex ${SEND_ME_BTN_PRIMARY_MD}`}
                style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
              >
                Open quotation builder
              </Link>
            </CardContent>
          </Card>

          <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <Receipt className="mb-2 h-10 w-10 text-white/90" />
              <CardTitle>Invoice</CardTitle>
              <CardDescription className="text-white/65">
                Tax invoice with due date — print or PDF for accounting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/sendme/admin/invoice"
                className={`inline-flex ${SEND_ME_BTN_PRIMARY_MD}`}
                style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
              >
                Open invoice builder
              </Link>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
