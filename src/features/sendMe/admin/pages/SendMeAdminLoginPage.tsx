import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import SEO from "@/components/SEO";
import { sendMeAdminLogin, getSendMeAdminPassword } from "../auth";
import { sendMeDarkPageShell } from "@/features/sendMe/constants/layout";
import { SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants/brand";
import { SEND_ME_BTN_PRIMARY_LG } from "@/features/sendMe/buttonStyles";

export default function SendMeAdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const hasConfiguredPassword = Boolean(getSendMeAdminPassword());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfiguredPassword) {
      toast.error("Send Me admin password is not configured. Set VITE_SENDME_ADMIN_PASSWORD in your environment.");
      return;
    }
    setLoading(true);
    try {
      if (sendMeAdminLogin(password)) {
        toast.success("Signed in to Send Me admin");
        navigate("/sendme/admin", { replace: true });
      } else {
        toast.error("Incorrect password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Send Me admin login" description="Staff sign-in for Send Me quotations and invoices." noindex />
      <div className={sendMeDarkPageShell}>
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
          <Button
            type="button"
            variant="ghost"
            asChild
            className="mb-6 w-fit text-white/90 hover:bg-white/10 hover:text-white"
          >
            <Link to="/book-service">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Send Me
            </Link>
          </Button>

          <Card className="border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Send Me admin</CardTitle>
              <CardDescription className="text-white/70">
                Quotations and invoices for staff only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!import.meta.env.DEV && !import.meta.env.VITE_SENDME_ADMIN_PASSWORD ? (
                <p className="mb-4 text-sm text-amber-200">
                  Set <code className="rounded bg-black/30 px-1">VITE_SENDME_ADMIN_PASSWORD</code> in{" "}
                  <code className="rounded bg-black/30 px-1">.env</code> and rebuild.
                </p>
              ) : null}
              {import.meta.env.DEV ? (
                <p className="mb-4 text-xs text-white/60">
                  Dev mode: default password is <code className="rounded bg-black/30 px-1">sendme</code> unless
                  overridden in <code className="rounded bg-black/30 px-1">.env</code>.
                </p>
              ) : null}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="sendme-admin-pass">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="sendme-admin-pass"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40"
                      placeholder="Enter admin password"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || !hasConfiguredPassword}
                  className={`w-full ${SEND_ME_BTN_PRIMARY_LG}`}
                  style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
