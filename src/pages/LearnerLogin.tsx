import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

const LearnerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/learner/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Learner Login" />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Learner Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} required className="h-12" />
              </div>
              <div>
                <Input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm(f=>({...f, password: e.target.value}))} required className="h-12" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <p className="text-sm text-gray-600 mt-4">No account? <Link to="/learner/register" className="text-blue-600 hover:underline">Register</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerLogin;


