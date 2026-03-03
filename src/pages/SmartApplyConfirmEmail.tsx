import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { smartApplyAPI } from "@/services/api";

const SmartApplyConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !token.trim()) {
      setStatus("error");
      setMessage("Invalid confirmation link. Please check your email for the correct link.");
      return;
    }
    smartApplyAPI
      .confirmEmail(token)
      .then((data: { token?: string }) => {
        setStatus("success");
        if (data.token) localStorage.setItem("smart_apply_token", data.token);
        setTimeout(() => navigate("/smart-apply"), 1500);
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err?.message || "Invalid or expired confirmation link.");
      });
  }, [token, navigate]);

  return (
    <Layout>
      <SEO title="Confirm Email – Smart Apply" />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />}
              {status === "success" && <CheckCircle2 className="h-6 w-6 text-green-600" />}
              {status === "error" && <XCircle className="h-6 w-6 text-red-600" />}
              {status === "loading" && "Confirming your email…"}
              {status === "success" && "Email confirmed!"}
              {status === "error" && "Confirmation failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your email."}
              {status === "success" && "Redirecting you to upload your CV so we can extract your information."}
              {status === "error" && message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <Button
                className="w-full"
                onClick={() => navigate("/smart-apply")}
              >
                Go to CV upload
              </Button>
            )}
            {status === "error" && (
              <Button variant="outline" onClick={() => navigate("/smart-apply/sign-in")}>
                Back to sign in
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SmartApplyConfirmEmail;
