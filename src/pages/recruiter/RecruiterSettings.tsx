import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Settings, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
    }
  }, [navigate]);

  return (
    <>
      <SEO title="Settings – Recruiter" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-gray-900">
            <Link to="/recruiter" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your recruiter account and security.</p>
          </div>

          {/* Account */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" /> Account
              </CardTitle>
              <CardDescription>Profile options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-start border-gray-300 text-gray-800 hover:bg-gray-50">
                <Link to="/recruiter/profile" className="inline-flex items-center gap-2">
                  Edit profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" /> Security
              </CardTitle>
              <CardDescription>Change your password. Use at least 6 characters for the new password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-1 max-w-md">
                <div>
                  <Label>Current password</Label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={passwordCurrent}
                    onChange={(e) => setPasswordCurrent(e.target.value)}
                    placeholder="Enter current password"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>New password</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    placeholder="At least 6 characters"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Repeat new password"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <Button
                  type="button"
                  disabled={
                    changingPassword ||
                    !passwordCurrent.trim() ||
                    !passwordNew.trim() ||
                    !passwordConfirm.trim()
                  }
                  onClick={async () => {
                    if (passwordNew.trim().length < 6) {
                      toast({
                        title: "New password must be at least 6 characters",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (passwordNew !== passwordConfirm) {
                      toast({
                        title: "New password and confirmation do not match",
                        variant: "destructive",
                      });
                      return;
                    }
                    setChangingPassword(true);
                    try {
                      await recruiterApi.changePassword(passwordCurrent, passwordNew.trim());
                      toast({ title: "Password updated" });
                      setPasswordCurrent("");
                      setPasswordNew("");
                      setPasswordConfirm("");
                    } catch (err) {
                      toast({
                        title: err instanceof Error ? err.message : "Failed to change password",
                        variant: "destructive",
                      });
                    } finally {
                      setChangingPassword(false);
                    }
                  }}
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                    </>
                  ) : (
                    "Update password"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RecruiterSettings;
