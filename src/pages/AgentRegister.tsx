import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowLeft, 
  Phone, 
  Upload, 
  FileText, 
  Shield, 
  Fingerprint,
  Camera,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  experience: string;
  motivation: string;
  documents: {
    criminalRecord: string;
    idDocument: string;
    fingerprintCheck: string;
    profilePicture: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

const AgentRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    dateOfBirth: "",
    experience: "",
    motivation: "",
  });
  const [documents, setDocuments] = useState({
    criminalRecord: "",
    idDocument: "",
    fingerprintCheck: "",
    profilePicture: "",
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Please describe your relevant experience";
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = "Please explain your motivation for becoming an agent";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Document validation
    if (!documents.criminalRecord) {
      newErrors.criminalRecord = "Criminal record check is required";
    }
    if (!documents.idDocument) {
      newErrors.idDocument = "ID document is required";
    }
    if (!documents.fingerprintCheck) {
      newErrors.fingerprintCheck = "Fingerprint check is required";
    }
    if (!documents.profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDocumentUpload = (field: string, value: string) => {
    setDocuments(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate application submission
    setTimeout(() => {
      const application: AgentApplication = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth,
        experience: formData.experience.trim(),
        motivation: formData.motivation.trim(),
        documents,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      // Save application to localStorage
      const existingApplications = JSON.parse(localStorage.getItem("agentApplications") || "[]");
      existingApplications.push(application);
      localStorage.setItem("agentApplications", JSON.stringify(existingApplications));

      // Create user account with agent role
      const user = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone,
        joinDate: new Date().toISOString(),
        role: 'agent',
        status: 'pending',
        applicationId: application.id,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "agent");
      
      toast.success("Agent Application Submitted!", {
        duration: 5000,
        description: "Your application has been submitted for review. You will be notified once it's approved."
      });
      
      navigate("/agent-dashboard");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </Button>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Become an IBIS Agent
            </CardTitle>
            <CardDescription className="text-gray-300">
              Join our team and help deliver exceptional services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-semibold">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.name 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.email 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white font-semibold">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.phone 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-white font-semibold">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.dateOfBirth 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white font-semibold">Full Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Enter your full address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                        errors.address 
                          ? "border-red-500 focus:border-red-500" 
                          : "border-gray-200 focus:border-blue-500"
                      } rounded-xl`}
                      required
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Experience & Motivation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Experience & Motivation
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-white font-semibold">Relevant Experience *</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Describe your relevant experience (customer service, delivery, etc.)"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                      errors.experience 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-500"
                    } rounded-xl`}
                    rows={3}
                    required
                  />
                  {errors.experience && (
                    <p className="text-red-400 text-sm mt-1">{errors.experience}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-white font-semibold">Motivation *</Label>
                  <Textarea
                    id="motivation"
                    name="motivation"
                    placeholder="Why do you want to become an IBIS agent?"
                    value={formData.motivation}
                    onChange={handleChange}
                    className={`border-2 transition-all duration-300 bg-white text-gray-900 ${
                      errors.motivation 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:border-blue-500"
                    } rounded-xl`}
                    rows={3}
                    required
                  />
                  {errors.motivation && (
                    <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>
                  )}
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Required Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="criminalRecord" className="text-white font-semibold">Criminal Record Check *</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="criminalRecord"
                        name="criminalRecord"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('criminalRecord', e.target.files?.[0]?.name || '')}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.criminalRecord 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.criminalRecord && (
                      <p className="text-red-400 text-sm mt-1">{errors.criminalRecord}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idDocument" className="text-white font-semibold">ID Document *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="idDocument"
                        name="idDocument"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('idDocument', e.target.files?.[0]?.name || '')}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.idDocument 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.idDocument && (
                      <p className="text-red-400 text-sm mt-1">{errors.idDocument}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fingerprintCheck" className="text-white font-semibold">Fingerprint Check *</Label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fingerprintCheck"
                        name="fingerprintCheck"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('fingerprintCheck', e.target.files?.[0]?.name || '')}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.fingerprintCheck 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.fingerprintCheck && (
                      <p className="text-red-400 text-sm mt-1">{errors.fingerprintCheck}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePicture" className="text-white font-semibold">Profile Picture *</Label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="profilePicture"
                        name="profilePicture"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('profilePicture', e.target.files?.[0]?.name || '')}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.profilePicture 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.profilePicture && (
                      <p className="text-red-400 text-sm mt-1">{errors.profilePicture}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Account Security
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-semibold">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.password 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-semibold">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-10 border-2 transition-all duration-300 bg-white text-gray-900 ${
                          errors.confirmPassword 
                            ? "border-red-500 focus:border-red-500" 
                            : "border-gray-200 focus:border-blue-500"
                        } rounded-xl`}
                        required
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Important Information:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Your application will be reviewed within 2-3 business days</li>
                      <li>• All documents must be clear and legible</li>
                      <li>• You will be notified via email once your application is reviewed</li>
                      <li>• Approved agents will receive access to the agent dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Submitting Application..." : "Submit Agent Application"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-300 hover:text-blue-200 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentRegister;
