import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, GraduationCap } from "lucide-react";
import { initializeGoogleAuth, renderGoogleButton, triggerGoogleSignIn } from "@/utils/googleAuth";
import { toast } from "sonner";

const LearnerLogin = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleFallback, setShowGoogleFallback] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google OAuth
    initializeGoogleAuth(
      async (credential) => {
        setIsGoogleLoading(true);
        try {
          await loginWithGoogle(credential);
          toast.success("Successfully signed in with Google");
          navigate("/learner/dashboard", { state: { fromLogin: true } });
        } catch (err: any) {
          setError(err.message || "Google sign in failed. Please try again.");
          toast.error(err.message || "Google sign in failed");
        } finally {
          setIsGoogleLoading(false);
        }
      },
      (error) => {
        setError(error);
        toast.error(error);
        setShowGoogleFallback(true);
      },
      () => {
        if (googleButtonRef.current) {
          renderGoogleButton(googleButtonRef.current, "signin_with");
          setTimeout(() => {
            const hasRenderedButton = !!googleButtonRef.current?.querySelector("iframe, div[role='button'], [aria-label*='Google']");
            if (!hasRenderedButton) setShowGoogleFallback(true);
          }, 300);
        }
      }
    );
  }, [loginWithGoogle, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/learner/dashboard", { state: { fromLogin: true } });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    triggerGoogleSignIn();
  };

  const lightBackBtn =
    "min-h-11 w-full gap-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 shadow-sm sm:w-auto";

  return (
    <div className="flex min-h-[100dvh] overflow-x-hidden">
      <SEO title="Learner Login" />
      
      {/* Left Side - Branding (Fixed) */}
      <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 items-center justify-center p-12">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Learner Portal</p>
            <h1 className="text-5xl font-bold text-white">Welcome Back</h1>
            <p className="text-xl text-gray-300">Continue your learning journey</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (Scrollable) */}
      <div className="flex min-h-[100dvh] w-full flex-col bg-white text-gray-900 lg:ml-[50%] lg:w-1/2">
        <div
          className="sticky top-0 z-20 border-b border-gray-100 bg-white px-4 py-3 sm:px-6 lg:static lg:border-0 lg:px-8 lg:pt-8"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
        >
          <Button asChild type="button" variant="outlineLight" className={lightBackBtn}>
            <Link to="/" className="inline-flex min-h-10 w-full items-center justify-center gap-2 text-gray-900 sm:w-auto sm:justify-start">
              <ChevronLeft className="h-4 w-4 shrink-0" />
              Back
            </Link>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="lg:hidden text-center mb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h1>
          </div>

          <div className="space-y-6">
            <h2 className="hidden lg:block text-xl sm:text-2xl font-bold text-gray-900">Sign in to your account</h2>

            {/* Google Login Button */}
            <div ref={googleButtonRef} className="w-full flex justify-center" style={{ minHeight: 44 }} />
            {showGoogleFallback && (
              <Button
                type="button"
                variant="outlineLight"
                className="w-full h-11 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="h-12 bg-white text-gray-900 border-gray-300"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="h-12 bg-white text-gray-900 border-gray-300"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/learner/register" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerLogin;


