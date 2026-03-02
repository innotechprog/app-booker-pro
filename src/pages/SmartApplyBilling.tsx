import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin } from "lucide-react";
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
}

interface ProfileAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

const SmartApplyBilling = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const selected = state.pkg;

  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Pre-fill from Smart Apply profile
  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) return;
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: { fullName?: string; email?: string; phone?: string; currentLocation?: string; addresses?: ProfileAddress[] } }) => {
        const p = res?.profile;
        if (!p) return;
        if (p.fullName) setFullName(p.fullName);
        if (p.email) setEmail(p.email);
        if (p.phone) setPhone(p.phone);
        const addrs = Array.isArray(p.addresses) ? p.addresses : [];
        const primary = addrs.find((a) => a.isPrimary) ?? addrs[0];
        if (primary) {
          const line1 = [primary.addressLine1, primary.addressLine2].filter(Boolean).join(", ");
          if (line1) setStreet(line1);
          if (primary.city) setCity(primary.city);
          if (primary.postalCode) setPostalCode(primary.postalCode);
          if (primary.country) setCountry(primary.country);
        } else if (p.currentLocation) {
          const parts = String(p.currentLocation).split(",").map((s) => s.trim()).filter(Boolean);
          if (parts.length >= 1) setCity(parts[0]);
          if (parts.length >= 2) setCountry(parts[parts.length - 1]);
        }
      })
      .catch(() => {});
  }, []);

  if (!selected) {
    // No package selected – send user back to Premium credits page
    navigate("/smart-apply/premium");
    return null;
  }

  const handleContinue = () => {
    if (!fullName.trim() || !street.trim() || !city.trim() || !postalCode.trim() || !country.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    navigate("/smart-apply/checkout", {
      state: {
        pkg: selected,
        billing: {
          fullName: fullName.trim(),
          street: street.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      },
    });
  };

  const canContinue =
    !!fullName.trim() &&
    !!street.trim() &&
    !!city.trim() &&
    !!postalCode.trim() &&
    !!country.trim() &&
    !!email.trim() &&
    !!phone.trim();

  return (
    <Layout>
      <SEO title="Billing – Smart Apply credits" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-700 hover:text-gray-900">
            <Link to="/smart-apply/premium" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to credits
            </Link>
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing details</h1>
            <p className="text-gray-600 mt-1">
              Confirm your information for the <strong>{selected.name}</strong> credit package.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.5fr_minmax(0,1fr)]">
            {/* Billing form */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <User className="h-4 w-4 text-gray-700" />
                  Your details
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  We use this to issue a receipt and link credits to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name (person or business name)</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Person or business name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing address</label>
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                      <input
                        type="text"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal code"
                      />
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 …"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  You’ll choose your payment method (PayFast or EFT) on the next step.
                </p>
                <Button
                  className="mt-2 w-full text-white font-semibold hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handleContinue}
                  disabled={!canContinue}
                >
                  Continue to checkout
                </Button>
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-900">
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  Credit package
                </CardTitle>
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
                  Credits do not expire and are only used when you accept a matched job from Smart Apply.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyBilling;

