import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

type Mode = "sign-in" | "sign-up";

const RecruiterAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "sign-up") {
        await recruiterApi.register({ fullName, email, password, company: company || undefined, phone: phone || undefined });
        toast({ title: "Account created" });
        navigate("/recruiter");
      } else {
        await recruiterApi.login(email, password);
        toast({ title: "Signed in" });
        navigate("/recruiter");
      }
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO title="Recruiter – Smart Apply" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: DEEP_BLUE }}>
              {mode === "sign-in" ? "Recruiter sign in" : "Create recruiter account"}
            </CardTitle>
            <CardDescription>
              {mode === "sign-in"
                ? "Sign in to access talent search and recruitments."
                : "Register to create recruitments and add candidates."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "sign-up" && (
                <>
                  <div>
                    <Label>Full name</Label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>Company (optional)</Label>
                    <Input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name"
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <Label>Phone (optional)</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone"
                      className="mt-1 bg-white border-gray-300"
                    />
                  </div>
                </>
              )}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="mt-1 bg-white border-gray-300"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "sign-up" ? "At least 6 characters" : "Password"}
                  required
                  minLength={mode === "sign-up" ? 6 : undefined}
                  className="mt-1 bg-white border-gray-300"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: DEEP_BLUE }}
              >
                {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              {mode === "sign-in" ? (
                <>
                  Don’t have an account?{" "}
                  <button type="button" onClick={() => setMode("sign-up")} className="font-medium text-blue-600 hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("sign-in")} className="font-medium text-blue-600 hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
            <p className="mt-2 text-center">
              <Link to="/recruiter" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to recruiter
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RecruiterAuth;
