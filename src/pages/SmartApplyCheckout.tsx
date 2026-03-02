import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";

const DEEP_BLUE = "#1e3a5f";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency?: string;
  description?: string;
}

interface LocationState {
  pkg?: CreditPackage;
  billing?: {
    fullName: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    email: string;
    phone?: string;
  };
}

const SmartApplyCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state || {}) as LocationState;
  const selected = state.pkg;
  const billing = state.billing;

  const [paymentMethod, setPaymentMethod] = useState<"payfast" | "eft">("payfast");
  const [processing, setProcessing] = useState(false);

  if (!selected) {
    navigate("/smart-apply/premium");
    return null;
  }

  const handlePay = () => {
    setProcessing(true);
    if (paymentMethod === "payfast") {
      setTimeout(() => {
        setProcessing(false);
        toast({
          title: "Redirecting to PayFast",
          description: "You will complete your secure payment on PayFast and then return to Smart Apply.",
        });
        navigate("/smart-apply/dashboard");
      }, 800);
    } else {
      setTimeout(() => {
        setProcessing(false);
        toast({
          title: "EFT details generated",
          description: "Use the bank details below and your reference to complete the transfer.",
        });
      }, 600);
    }
  };

  const reference = `CRED-${selected.id.toUpperCase()}-${new Date().getTime().toString().slice(-6)}`;

  return (
    <Layout>
      <SEO title="Checkout – Smart Apply credits" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-700 hover:text-gray-900">
            <Link to="/smart-apply/billing" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to billing
            </Link>
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">
              Choose how you want to pay for <strong>{selected.name}</strong> credits.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Payment method */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-900">Payment method</CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Select PayFast or EFT / bank transfer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("payfast")}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                      paymentMethod === "payfast"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 shrink-0">
                      <CreditCard className="h-5 w-5 text-emerald-700" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">PayFast</span>
                      <span className="block text-xs text-gray-600">Secure card / voucher / EFT</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("eft")}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                      paymentMethod === "eft"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100 shrink-0">
                      <Banknote className="h-5 w-5 text-amber-700" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">EFT / Bank</span>
                      <span className="block text-xs text-gray-600">Bank transfer</span>
                    </span>
                  </button>
                </div>

                {paymentMethod === "payfast" && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-900">
                    You will be redirected to <strong>PayFast</strong> to complete your payment securely, then returned
                    to Smart Apply.
                  </div>
                )}

                {paymentMethod === "eft" && (
                  <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                    <p className="font-semibold">Bank details</p>
                    <p>Bank: Standard Bank</p>
                    <p>Account: 1234567890</p>
                    <p>Branch code: 051001</p>
                    <p>
                      Reference: <span className="font-mono font-semibold">{reference}</span>
                    </p>
                    <p className="text-[11px] mt-1">
                      Use this reference so we can allocate your payment. Credits will be added once payment is
                      confirmed.
                    </p>
                  </div>
                )}

                <Button
                  className="mt-3 w-full text-white font-semibold hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handlePay}
                  disabled={processing}
                >
                  {processing
                    ? "Processing..."
                    : paymentMethod === "payfast"
                    ? "Pay with PayFast"
                    : "Generate EFT details"}
                </Button>
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-gray-900">Order summary</CardTitle>
                <CardDescription className="text-xs text-gray-600 space-y-1">
                  {billing?.fullName && (
                    <span className="block">
                      Billing to <strong>{billing.fullName}</strong>
                    </span>
                  )}
                  {billing?.email && <span className="block">{billing.email}</span>}
                  {billing?.phone && <span className="block">{billing.phone}</span>}
                  {(billing?.street || billing?.city) && (
                    <span className="block">
                      {[billing.street, billing.city, billing.postalCode, billing.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selected.name}</span>
                  <span className="font-semibold">
                    {selected.currency ?? "ZAR"} {selected.price}
                  </span>
                </div>
                <p className="text-gray-600">{selected.credits} auto-apply credits</p>
                {selected.description && (
                  <p className="text-gray-500 text-xs mt-1">{selected.description}</p>
                )}
                <div className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-500">
                  Credits are linked to your Smart Apply profile and are used only when you accept an auto-apply match.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyCheckout;

