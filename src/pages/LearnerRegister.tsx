import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import { initializeGoogleAuth, triggerGoogleSignIn } from "@/utils/googleAuth";
import { toast } from "sonner";

const grades = [
  { id: "Grade 1", name: "Grade 1" },
  { id: "Grade 2", name: "Grade 2" },
  { id: "Grade 3", name: "Grade 3" },
  { id: "Grade 4", name: "Grade 4" },
  { id: "Grade 5", name: "Grade 5" },
  { id: "Grade 6", name: "Grade 6" },
  { id: "Grade 7", name: "Grade 7" },
  { id: "Grade 8", name: "Grade 8" },
  { id: "Grade 9", name: "Grade 9" },
  { id: "Grade 10", name: "Grade 10" },
  { id: "Grade 11", name: "Grade 11" },
  { id: "Grade 12", name: "Grade 12" },
  { id: "University", name: "University" }
];

const LearnerRegister = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    grade: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google OAuth
    initializeGoogleAuth(
      async (credential) => {
        setIsGoogleLoading(true);
        try {
          await loginWithGoogle(credential);
          toast.success("Successfully signed up with Google");
          navigate("/learner/dashboard", { state: { fromLogin: true } });
        } catch (err: any) {
          setError(err.message || "Google sign up failed. Please try again.");
          toast.error(err.message || "Google sign up failed");
        } finally {
          setIsGoogleLoading(false);
        }
      },
      (error) => {
        setError(error);
        toast.error(error);
      }
    );
  }, [loginWithGoogle, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register(form);
      navigate("/learner/dashboard", { state: { fromLogin: true } });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    triggerGoogleSignIn();
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <SEO title="Learner Register" />
      
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
            <h1 className="text-5xl font-bold text-white">Join Today</h1>
            <p className="text-xl text-gray-300">Start your learning journey with us</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form (Scrollable) */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center bg-white p-8 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Join Today</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            
            {/* Google Signup Button */}
            <Button
              type="button"
              variant="outlineLight"
              className="w-full h-12"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Signing up...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                </>
              )}
            </Button>
            <div ref={googleButtonRef} className="hidden"></div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Registration Form */}
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input
                  placeholder="Full name"
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Select value={form.grade} onValueChange={(v) => setForm(f => ({ ...f, grade: v }))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to the{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>

            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/learner/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerRegister;


